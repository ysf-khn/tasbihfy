import { useState, useRef, useEffect, useCallback } from 'react';
import { getAyahAudioUrl } from '@/lib/quran/api';
import { useQuranSettings } from './useQuranSettings';

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentVerseKey: string | null;
  currentAudioUrl: string | null;
  progress: number; // 0-100
  duration: number; // seconds
  currentTime: number; // seconds
}

export interface AudioControls {
  playAyah: (verseKey: string) => Promise<void>;
  pauseAyah: () => void;
  stopAyah: () => void;
  togglePlayPause: (verseKey: string) => Promise<void>;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  isCurrentlyPlaying: (verseKey: string) => boolean;
  isCurrentlyLoading: (verseKey: string) => boolean;
}

export function useQuranAudio(): AudioState & AudioControls {
  const { settings } = useQuranSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentVerseKey: null,
    currentAudioUrl: null,
    progress: 0,
    duration: 0,
    currentTime: 0
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({ 
        ...prev, 
        duration: audio.duration || 0,
        isLoading: false 
      }));
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 0;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      setState(prev => ({
        ...prev,
        currentTime,
        progress
      }));
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        progress: 0,
        currentTime: 0
      }));
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load audio. Please try again.'
      }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true, error: null }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Cleanup
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const playAyah = useCallback(async (verseKey: string) => {
    if (!audioRef.current) return;

    try {
      // Check if it's the same audio that's already loaded (before setting loading)
      const currentSrc = audioRef.current.src;
      
      // Set loading state immediately for new verse requests
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        currentVerseKey: verseKey
      }));

      // Get audio URL (this is the slow operation)
      const audioUrl = await getAyahAudioUrl(settings.selectedRecitationId || 7, verseKey);
      
      if (!audioUrl) {
        throw new Error('Audio not available for this verse');
      }

      // Check if it's the same audio that's already loaded
      const isSameAudio = currentSrc === audioUrl && !audioRef.current.ended;
      
      if (isSameAudio) {
        // Just resume existing audio - clear loading state
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: null,
          currentVerseKey: verseKey
        }));
        await audioRef.current.play();
        return;
      }

      // Always stop current audio before starting new one
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }

      // Load new audio
      audioRef.current.src = audioUrl;
      setState(prev => ({ 
        ...prev, 
        currentAudioUrl: audioUrl,
        currentVerseKey: verseKey
        // isLoading stays true until canplay event
      }));

      await audioRef.current.play();

    } catch (error) {
      console.error('Failed to play ayah:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : 'Failed to play audio'
      }));
    }
  }, [settings.selectedRecitationId]);

  const pauseAyah = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const stopAyah = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({
        ...prev,
        isPlaying: false,
        progress: 0,
        currentTime: 0,
        currentVerseKey: null,
        currentAudioUrl: null
      }));
    }
  }, []);

  const togglePlayPause = useCallback(async (verseKey: string) => {
    // If it's the same verse and currently playing, just pause
    if (state.currentVerseKey === verseKey && state.isPlaying) {
      pauseAyah();
      return; // Important: return after pause to prevent falling through
    }
    
    // For all other cases (new verse, same verse but paused), just play
    await playAyah(verseKey);
  }, [state.currentVerseKey, state.isPlaying, playAyah, pauseAyah]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const isCurrentlyPlaying = useCallback((verseKey: string) => {
    return state.currentVerseKey === verseKey && state.isPlaying;
  }, [state.currentVerseKey, state.isPlaying]);

  const isCurrentlyLoading = useCallback((verseKey: string) => {
    return state.currentVerseKey === verseKey && state.isLoading;
  }, [state.currentVerseKey, state.isLoading]);

  return {
    ...state,
    playAyah,
    pauseAyah,
    stopAyah,
    togglePlayPause,
    seekTo,
    setVolume,
    isCurrentlyPlaying,
    isCurrentlyLoading
  };
}