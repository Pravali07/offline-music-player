import { Audio, AVPlaybackStatus } from 'expo-av';

let sound: Audio.Sound | null = null;

export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
}

export async function loadAudio(
  uri: string,
  onStatusUpdate: (status: AVPlaybackStatus) => void
): Promise<Audio.Sound> {
  if (sound) {
    await sound.unloadAsync();
  }

  const { sound: newSound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true }
  );

  newSound.setOnPlaybackStatusUpdate(onStatusUpdate);
  sound = newSound;
  return sound;
}

export async function playAudio(): Promise<void> {
  if (sound) {
    await sound.playAsync();
  }
}

export async function pauseAudio(): Promise<void> {
  if (sound) {
    await sound.pauseAsync();
  }
}

export async function seekAudio(positionMs: number): Promise<void> {
  if (sound) {
    await sound.setPositionAsync(positionMs);
  }
}

export async function unloadAudio(): Promise<void> {
  if (sound) {
    await sound.unloadAsync();
    sound = null;
  }
}

export function getSound(): Audio.Sound | null {
  return sound;
}
