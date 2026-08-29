"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSurahAudioTracks, getVerseWords } from "@/lib/quran/api";
import { findWordAt } from "@/lib/quran/audio-segments";
import { AudioTrack, VerseWord } from "@/lib/quran/types";
import { useQuranSettings } from "@/hooks/useQuranSettings";

export type RepeatMode = "off" | "verse" | "surah";

interface QuranAudioValue {
  /** Verse key of the track currently loaded, e.g. "2:255". */
  currentVerseKey: string | null;
  currentVerseNumber: number | null;
  /** 1-based position of the word being recited, when timings are available. */
  activeWordPosition: number | null;
  /** Words of the current verse, fetched lazily once playback reaches it. */
  currentWords: VerseWord[];
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  trackCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  /** True once a playlist exists — the player bar renders off this. */
  isActive: boolean;

  playVerse: (verseNumber: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  stop: () => void;
}

const QuranAudioContext = createContext<QuranAudioValue | null>(null);

export function useQuranAudioPlayer() {
  const context = useContext(QuranAudioContext);
  if (!context) {
    throw new Error("useQuranAudioPlayer must be used within a QuranAudioProvider");
  }
  return context;
}

interface QuranAudioProviderProps {
  surahId: number;
  surahName: string;
  children: React.ReactNode;
}

export function QuranAudioProvider({
  surahId,
  surahName,
  children,
}: QuranAudioProviderProps) {
  const { settings } = useQuranSettings();
  const recitationId = settings.selectedRecitationId || 7;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** Hidden element used only to warm the next verse's mp3 in the browser cache. */
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [activeWordPosition, setActiveWordPosition] = useState<number | null>(null);
  const [currentWords, setCurrentWords] = useState<VerseWord[]>([]);

  const currentTrack = currentIndex === null ? null : tracks[currentIndex] ?? null;

  // Keep the latest values reachable from event handlers bound once on mount.
  const stateRef = useRef({ tracks, currentIndex, repeatMode });
  stateRef.current = { tracks, currentIndex, repeatMode };

  // --- element setup -------------------------------------------------------

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const preload = new Audio();
    preload.preload = "auto";
    preloadRef.current = preload;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError("Couldn't load this recitation. Check your connection and try again.");
    };
    const handleEnded = () => {
      const { tracks: list, currentIndex: index, repeatMode: repeat } = stateRef.current;
      if (index === null) return;

      if (repeat === "verse") {
        audio.currentTime = 0;
        void audio.play().catch(() => undefined);
        return;
      }
      if (index < list.length - 1) {
        setCurrentIndex(index + 1);
        return;
      }
      if (repeat === "surah" && list.length > 0) {
        setCurrentIndex(0);
        return;
      }
      setIsPlaying(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
      preload.src = "";
      audioRef.current = null;
      preloadRef.current = null;
    };
  }, []);

  // --- playlist ------------------------------------------------------------

  // Reset when the surah or reciter changes; the playlist is per (surah, reciter).
  useEffect(() => {
    let cancelled = false;

    audioRef.current?.pause();
    setTracks([]);
    setCurrentIndex(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActiveWordPosition(null);
    setCurrentWords([]);
    setError(null);

    getSurahAudioTracks(recitationId, surahId)
      .then((list) => {
        if (!cancelled) setTracks(list);
      })
      .catch((err) => {
        console.error("Failed to load surah audio:", err);
        if (!cancelled) setError("Couldn't load the recitation for this surah.");
      });

    return () => {
      cancelled = true;
    };
  }, [recitationId, surahId]);

  // --- track changes -------------------------------------------------------

  // Load the selected track and start it. Every index change plays, which is
  // what makes auto-advance, next/prev and "play from this verse" one path.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setActiveWordPosition(null);
    setCurrentTime(0);
    setIsLoading(true);
    audio.src = currentTrack.url;
    audio.playbackRate = playbackRate;
    void audio.play().catch((err) => {
      // Autoplay rejection is expected before the first user gesture.
      if (err?.name !== "AbortError") {
        console.error("Playback failed:", err);
      }
      setIsLoading(false);
    });
    // playbackRate is applied here but must not re-trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Warm the next verse's audio so Next has nothing to download.
  useEffect(() => {
    if (currentIndex === null) return;
    const nextTrack = tracks[currentIndex + 1];
    if (nextTrack && preloadRef.current) {
      preloadRef.current.src = nextTrack.url;
    }
  }, [currentIndex, tracks]);

  // Pull the word breakdown for the current verse, and warm the next one.
  useEffect(() => {
    if (!currentTrack) {
      setCurrentWords([]);
      return;
    }
    let cancelled = false;

    getVerseWords(currentTrack.verseKey).then((words) => {
      if (!cancelled) setCurrentWords(words);
    });

    const nextTrack = currentIndex === null ? null : tracks[currentIndex + 1];
    if (nextTrack) void getVerseWords(nextTrack.verseKey);

    return () => {
      cancelled = true;
    };
  }, [currentTrack, currentIndex, tracks]);

  // --- word highlight loop -------------------------------------------------

  // Driven by requestAnimationFrame rather than `timeupdate`, which only fires
  // about four times a second — far too coarse to land on the right word.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const segments = currentTrack?.segments ?? [];

    const tick = () => {
      setCurrentTime(audio.currentTime);
      if (segments.length > 0) {
        setActiveWordPosition(findWordAt(segments, audio.currentTime * 1000));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, currentTrack]);

  // --- lock screen / notification controls ---------------------------------

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${surahName} ${currentTrack.verseKey}`,
      artist: recitationId === 6 ? "Mahmoud Khalil Al-Husary" : "Mishari Rashid al-`Afasy",
      album: "Quran",
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentTrack, isPlaying, surahName, recitationId]);

  // --- controls ------------------------------------------------------------

  const playVerse = useCallback(
    (verseNumber: number) => {
      const index = tracks.findIndex((track) => track.verseNumber === verseNumber);
      if (index === -1) return;

      if (index === currentIndex) {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
          void audio.play().catch(() => undefined);
        } else {
          audio.pause();
        }
        return;
      }
      setCurrentIndex(index);
    },
    [tracks, currentIndex]
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentIndex === null) {
      if (tracks.length > 0) setCurrentIndex(0);
      return;
    }
    if (audio.paused) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, [currentIndex, tracks.length]);

  const next = useCallback(() => {
    setCurrentIndex((index) =>
      index !== null && index < tracks.length - 1 ? index + 1 : index
    );
  }, [tracks.length]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    // Match the music-player convention: restart the verse unless we're near
    // its start, in which case step back one.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentIndex((index) => (index !== null && index > 0 ? index - 1 : index));
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setCurrentIndex(null);
    setIsPlaying(false);
    setActiveWordPosition(null);
    setCurrentWords([]);
    setCurrentTime(0);
  }, []);

  // Media Session action handlers need the latest callbacks.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", toggle);
    navigator.mediaSession.setActionHandler("pause", toggle);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", previous);
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [toggle, next, previous]);

  const value = useMemo<QuranAudioValue>(
    () => ({
      currentVerseKey: currentTrack?.verseKey ?? null,
      currentVerseNumber: currentTrack?.verseNumber ?? null,
      activeWordPosition,
      currentWords,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      playbackRate,
      repeatMode,
      trackCount: tracks.length,
      hasPrevious: currentIndex !== null && currentIndex > 0,
      hasNext: currentIndex !== null && currentIndex < tracks.length - 1,
      isActive: currentIndex !== null,
      playVerse,
      toggle,
      next,
      previous,
      seekTo,
      setPlaybackRate,
      setRepeatMode,
      stop,
    }),
    [
      currentTrack,
      activeWordPosition,
      currentWords,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      playbackRate,
      repeatMode,
      tracks.length,
      currentIndex,
      playVerse,
      toggle,
      next,
      previous,
      seekTo,
      setPlaybackRate,
      stop,
    ]
  );

  return (
    <QuranAudioContext.Provider value={value}>{children}</QuranAudioContext.Provider>
  );
}
