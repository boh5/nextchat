import { Providers } from './providers';
import './globals.css';
import { NavBar } from '@/components/nav-bar';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SessionProvider>
            <NavBar />
            {children}
            <Toaster />
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
