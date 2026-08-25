import type { PropsWithChildren } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { sharedStyles } from '../theme';

type AppScreenProps = PropsWithChildren<{
  edges?: Edge[];
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
}>;

export function AppScreen({ children, edges = ['top'], scroll = false, scrollProps }: AppScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={sharedStyles.screen}>
        <ScrollView {...scrollProps} style={sharedStyles.screen} contentContainerStyle={[sharedStyles.scrollContent, scrollProps?.contentContainerStyle]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <SafeAreaView edges={edges} style={sharedStyles.screen}>{children}</SafeAreaView>;
}
