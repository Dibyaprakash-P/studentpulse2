import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Student Pulse | AI Burnout Analytics',
  description: 'AI-Powered Student Burnout & Lifestyle Analytics Platform',
  manifest: '/manifest.json',
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
