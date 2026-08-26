import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { colors, radii, sizes, spacing } from '../theme';

export type ActionSheetAction = {
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  onPress: () => void;
};

type ActionSheetProps = {
  visible: boolean;
  title?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
};

export function ActionSheet({ actions, onClose, title, visible }: ActionSheetProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable accessibilityLabel="Close actions" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <View style={styles.sheet}>
            {title ? <AppText variant="section" style={styles.title}>{title}</AppText> : null}
            {actions.map((action, index) => (
              <Pressable
                key={`${action.label}-${index}`}
                accessibilityRole="button"
                android_ripple={{ color: colors.actionMuted }}
                onPress={() => {
                  onClose();
                  action.onPress();
                }}
                style={({ pressed }) => [styles.row, index > 0 && styles.divider, pressed && styles.pressed]}
              >
                {action.icon ? <View style={styles.icon}>{action.icon}</View> : null}
                <AppText variant="action" tone={action.destructive ? 'danger' : 'primary'} style={styles.label}>{action.label}</AppText>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" android_ripple={{ color: colors.actionMuted }} onPress={onClose} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
              <AppText variant="action" tone="action">Cancel</AppText>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.scrim, flex: 1, justifyContent: 'flex-end' },
  safeArea: { backgroundColor: 'transparent' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radii.card, borderTopRightRadius: radii.card, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { paddingBottom: spacing.sm, paddingTop: spacing.xs },
  row: { alignItems: 'center', flexDirection: 'row', minHeight: sizes.rowMinimum },
  divider: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth },
  icon: { alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, width: sizes.touchMinimum },
  label: { flex: 1 },
  cancel: { alignItems: 'center', borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: sizes.rowMinimum, marginTop: spacing.xs },
  pressed: { backgroundColor: colors.surfaceMuted },
});
