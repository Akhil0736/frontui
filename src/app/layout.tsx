import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { ChatProvider } from '@/context/ChatContext';
import AppLayout from '@/components/AppLayout';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Luna Dashboard',
  description: 'Welcome to Luna',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </ChatProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
