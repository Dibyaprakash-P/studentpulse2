import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import StarBackgroundWrapper from '@/components/ui/StarBackgroundWrapper';
import SplashScreen from '@/components/ui/SplashScreen';

export const metadata = {
  title: 'Student Pulse | AI Burnout Analytics',
  description: 'AI-Powered Student Burnout & Lifestyle Analytics Platform',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <StarBackgroundWrapper />
        <ThemeProvider>
          <AuthProvider>
            <SplashScreen />
            <div style={{ position: "relative", zIndex: 1 }}>
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
