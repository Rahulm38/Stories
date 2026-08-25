import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';
import { colors } from '@/src/ui/theme';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `body { background-color: ${colors.canvas}; }` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
