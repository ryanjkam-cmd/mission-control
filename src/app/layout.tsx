import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import SideNav from '@/components/layout/SideNav';

export const metadata: Metadata = {
  title: 'Mission Control - Arkeus Marketing Agency',
  description: 'Full-service marketing agency dashboard powered by Arkeus cognitive OS',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            <SideNav />
            <main className="flex-1 overflow-y-auto lg:ml-72 transition-all duration-300">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
