import * as MediaLibrary from 'expo-media-library';
import * as Linking from 'expo-linking';
import { AppState, AppStateStatus, Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export interface PermissionState {
  status: PermissionStatus;
  canAskAgain: boolean;
  isExpoGo?: boolean;
}

export async function requestPermissions(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    return { status: 'undetermined', canAskAgain: true };
  }

  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    return mapPermissionStatus(status, canAskAgain);
  } catch (error) {
    console.warn('Permission request not available (Expo Go limitation)');
    return { status: 'denied', canAskAgain: false, isExpoGo: true };
  }
}

export async function getPermissionStatus(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    return { status: 'undetermined', canAskAgain: true };
  }

  try {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    return mapPermissionStatus(status, canAskAgain);
  } catch (error) {
    console.warn('Permission check not available (Expo Go limitation)');
    return { status: 'denied', canAskAgain: false, isExpoGo: true };
  }
}

export function openPermissionSettings(): void {
  if (Platform.OS !== 'web') {
    Linking.openSettings();
  }
}

export function createAppStateListener(
  callback: (status: PermissionStatus) => void
): () => void {
  if (Platform.OS === 'web') {
    return () => {};
  }

  const listener = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      getPermissionStatus().then(({ status }) => callback(status));
    }
  };

  const subscription = AppState.addEventListener('change', listener);
  return () => subscription.remove();
}

function mapPermissionStatus(
  status: MediaLibrary.PermissionStatus | string,
  canAskAgain: boolean
): PermissionState {
  switch (status) {
    case 'granted':
      return { status: 'granted' as PermissionStatus, canAskAgain: true };
    case 'denied':
      return { status: 'denied' as PermissionStatus, canAskAgain };
    case 'blocked':
      return { status: 'blocked' as PermissionStatus, canAskAgain: false };
    default:
      return { status: 'undetermined' as PermissionStatus, canAskAgain: true };
  }
}
