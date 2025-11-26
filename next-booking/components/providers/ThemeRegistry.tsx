'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';

import { theme } from '../../lib/theme';

type Props = {
  children: React.ReactNode;
};

function createEmotionCache() {
  return createCache({ key: 'mui', prepend: true });
}

export function ThemeRegistry({ children }: Props) {
  const [cache] = useState(() => {
    const emotionCache = createEmotionCache();

    emotionCache.compat = true;
    return emotionCache;
  });

  useServerInsertedHTML(() => {
    const styles = cache.inserted;
    const ids = Object.keys(styles);

    if (ids.length === 0) {
      return null;
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${ids.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: ids.map((id) => styles[id as keyof typeof styles]).join(' ')
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
