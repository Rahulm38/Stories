export function tabBarMetrics(bottomInset: number, isIOS: boolean) {
  const bottomPadding = Math.max(bottomInset, isIOS ? 18 : 16);
  return {
    bottomPadding,
    height: 58 + bottomPadding,
  };
}
