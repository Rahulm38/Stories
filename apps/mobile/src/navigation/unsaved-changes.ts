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
  setOptions: (options: { gestureEnabled: boolean }) => void;
  addListener: (
    event: 'beforeRemove',
    listener: (event: BeforeRemoveEvent) => void,
  ) => () => void;
};

type DiscardHandler = () => void | Promise<void>;

export function useUnsavedChangesGuard(
  dirty: boolean,
  busy = false,
  onDiscard?: DiscardHandler,
): () => void {
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
        Alert.alert('Save in progress', 'Stories is finishing this memory.');
        return;
      }

      Alert.alert('Discard changes?', 'Your unfinished memory will be removed.', [
        { text: 'Keep writing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            void Promise.resolve(onDiscard?.())
              .catch(() => undefined)
              .then(() => {
                allowNextRemoval.current = true;
                navigation.dispatch(event.data.action);
              });
          },
        },
      ]);
    },
    [busy, navigation, onDiscard],
  );

  useEffect(() => {
    if (Platform.OS === 'ios') {
      navigation.setOptions({ gestureEnabled: !dirty && !busy });
      return () => navigation.setOptions({ gestureEnabled: true });
    }
    return undefined;
  }, [busy, dirty, navigation]);

  useEffect(() => {
    if (Platform.OS === 'web' || (!dirty && !busy)) return undefined;
    return navigation.addListener('beforeRemove', handleBeforeRemove);
  }, [busy, dirty, handleBeforeRemove, navigation]);

  return allowNextNavigation;
}
