import { Audio, AVPlaybackStatus } from 'expo-av';
import type { Song } from '@/types';

class AudioService {
  private sound: Audio.Sound | null = null;
  private onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async initialize(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  setOnPlaybackStatusUpdate(callback: (status: AVPlaybackStatus) => void): void {
    this.onPlaybackStatusUpdate = callback;
  }

  async loadAndPlay(song: Song): Promise<void> {
    await this.unload();
    const { sound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true },
      this.handlePlaybackStatusUpdate.bind(this)
    );
    this.sound = sound;
  }

  private handlePlaybackStatusUpdate(status: AVPlaybackStatus): void {
    if (this.onPlaybackStatusUpdate) {
      this.onPlaybackStatusUpdate(status);
    }
  }

  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  async unload(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  async setIsLooping(isLooping: boolean): Promise<void> {
    if (this.sound) {
      await this.sound.setIsLoopingAsync(isLooping);
    }
  }
}

export const audioService = new AudioService();
