import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeOS — AI Chief of Staff for Students',
  description:
    'Upload a screenshot, notice, or PDF. LifeOS extracts deadlines, checks eligibility, creates tasks, calendar events, and study plans — automatically.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LifeOS',
  },
  openGraph: {
    title: 'LifeOS — AI Chief of Staff for Students',
    description: 'Your AI-powered student operating system',
    type: 'website',
  },
  keywords: ['student', 'AI', 'productivity', 'placement', 'tasks', 'schedule', 'study'],
  authors: [{ name: 'LifeOS' }],
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          {/* PWA / installability */}
          <meta name="application-name" content="LifeOS" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="LifeOS" />

          {/* Apple touch icons */}
          <link rel="apple-touch-icon" href="/favicon.png" />
          <link rel="apple-touch-icon" sizes="192x192" href="/favicon.png" />
          <link rel="apple-touch-icon" sizes="512x512" href="/favicon.png" />

          {/* Android / Chrome */}
          <link rel="icon" type="image/png" sizes="192x192" href="/favicon.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
          <link rel="shortcut icon" href="/favicon.png" />

          {/* Splash screen colour for Android */}
          <meta name="theme-color" content="#09090b" />
          <meta name="msapplication-TileColor" content="#09090b" />
          <meta name="msapplication-TileImage" content="/favicon.png" />

          {/* Fonts preconnect */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* Service Worker registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' })
                      .then(function(reg) {
                        console.log('[LifeOS SW] registered:', reg.scope);
                      })
                      .catch(function(err) {
                        console.warn('[LifeOS SW] registration failed:', err);
                      });
                  });
                }
              `,
            }}
          />
        </head>
        <body className="bg-surface text-white font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
