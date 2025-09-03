"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { VerseWithTranslations } from '@/lib/quran/types';
import { getAudioUrl, getAyahRecitation, getRecitations } from '@/lib/quran/api';
import { AUDIO_RECITERS } from '@/lib/quran/constants';

interface AudioPlayerProps {
  surahId: number;
  verses: VerseWithTranslations[];
  onStop: () => void;
}

export default function AudioPlayer({ surahId, verses, onStop }: AudioPlayerProps) {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('mishari-al-afasy');
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load reciter preference
    try {
      const savedReciter = localStorage.getItem('quran_selected_reciter');
      if (savedReciter) {
        setSelectedReciter(savedReciter);
      }
    } catch (error) {
      console.error('Failed to load reciter preference:', error);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      loadCurrentVerse();
    }
  }, [currentVerseIndex, selectedReciter]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => handleNext();
    const handleError = (e: any) => {
      console.error('Audio error:', e);
      setError('Failed to load audio. Please try again.');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentVerseIndex]);

  const loadCurrentVerse = () => {
    if (!audioRef.current || !verses[currentVerseIndex]) return;

    const verse = verses[currentVerseIndex];
    const audioUrl = getAudioUrl(surahId, verse.verse_number, selectedReciter);
    
    audioRef.current.src = audioUrl;
    audioRef.current.volume = isMuted ? 0 : volume;
    
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setError('Failed to play audio');
        setIsPlaying(false);
      });
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setError(null);
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    } else {
      // End of surah
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const handleReciterChange = (newReciter: string) => {
    setSelectedReciter(newReciter);
    try {
      localStorage.setItem('quran_selected_reciter', newReciter);
    } catch (error) {
      console.error('Failed to save reciter preference:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentVerse = verses[currentVerseIndex];
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-200 shadow-lg">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-error/10 text-error text-sm text-center">
          {error}
        </div>
      )}

      <div className="container mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="mb-3">
          <div 
            ref={progressRef}
            className="w-full h-1 bg-base-300 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-base-content/60 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Current Verse Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              Verse {currentVerse?.verse_number} of {verses.length}
            </div>
            <div className="text-xs text-base-content/60">
              {AUDIO_RECITERS[selectedReciter as keyof typeof AUDIO_RECITERS]?.name}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentVerseIndex === 0}
              className="btn btn-ghost btn-sm btn-square"
            >
              <BackwardIcon className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="btn btn-primary btn-sm btn-square"
            >
              {isLoading ? (
                <div className="loading loading-spinner loading-xs" />
              ) : isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentVerseIndex === verses.length - 1}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ForwardIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="btn btn-ghost btn-sm btn-square"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-4 h-4" />
              ) : (
                <SpeakerWaveIcon className="w-4 h-4" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="range range-xs range-primary w-16"
            />
          </div>

          {/* Reciter Selection */}
          <select
            value={selectedReciter}
            onChange={(e) => handleReciterChange(e.target.value)}
            className="select select-bordered select-xs max-w-xs hidden md:block"
          >
            {Object.entries(AUDIO_RECITERS).map(([key, reciter]) => (
              <option key={key} value={key}>
                {reciter.name}
              </option>
            ))}
          </select>

          {/* Close Button */}
          <button
            onClick={onStop}
            className="btn btn-ghost btn-sm btn-square"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}