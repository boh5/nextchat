import { Providers } from './providers';
import './globals.css';
import { NavBar } from '@/components/nav-bar';
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
