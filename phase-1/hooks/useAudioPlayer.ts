import { useCallback, useEffect } from 'react';
import type { AVPlaybackStatus } from 'expo-av';
import { audioService } from '@/services';
import { usePlayerStore } from '@/stores';

export function useAudioPlayer() {
  const { currentSong, isPlaying, position, duration, setIsPlaying, setPosition, setDuration } = usePlayerStore();

  useEffect(() => {
    const handleStatusUpdate = (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis ?? 0);
        setIsPlaying(status.isPlaying);
      }
    };

    audioService.initialize();
    audioService.setOnPlaybackStatusUpdate(handleStatusUpdate);
  }, [setPosition, setDuration, setIsPlaying]);

  const play = useCallback(async () => {
    await audioService.play();
  }, []);

  const pause = useCallback(async () => {
    await audioService.pause();
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    await audioService.seekTo(positionMs);
  }, []);

  return {
    currentSong,
    isPlaying,
    position,
    duration,
    play,
    pause,
    seek,
  };
}
