import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

type NavigationAction = unknown;
type BeforeRemoveEvent = {
  data: { action: NavigationAction };
  preventDefault: () => void;
};
type Navigation = {
  dispatch: (action: NavigationAction) => void;
  addListener: (
    event: 'beforeRemove',
    listener: (event: BeforeRemoveEvent) => void,
  ) => () => void;
};

export function useUnsavedChangesGuard(dirty: boolean, busy = false): () => void {
  const navigation = useNavigation<Navigation>();
  const allowNextRemoval = useRef(false);
  const allowNextNavigation = useCallback(() => {
    allowNextRemoval.current = true;
  }, []);

  const handleBeforeRemove = useCallback(
    (event: BeforeRemoveEvent) => {
      if (allowNextRemoval.current) {
        allowNextRemoval.current = false;
        return;
      }

      event.preventDefault();

      if (busy) {
        Alert.alert('Save in progress', 'Please wait for Stories to finish saving this memory.');
        return;
      }

      Alert.alert('Discard changes?', 'Your unsaved changes will be lost.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            allowNextRemoval.current = true;
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    },
    [busy, navigation],
  );

  useEffect(() => {
    if (Platform.OS === 'web' || (!dirty && !busy)) {
      return undefined;
    }

    return navigation.addListener('beforeRemove', handleBeforeRemove);
  }, [busy, dirty, handleBeforeRemove, navigation]);

  return allowNextNavigation;
}
