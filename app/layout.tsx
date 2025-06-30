import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Navbar } from '@/components/Navbar';
import { AuthProvider, useAuthProvider } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BagCraft Pro - Bag Repair & Manufacturing',
  description: 'Professional bag repair and manufacturing management system',
};

function AppContent({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  return (
    <AuthProvider value={auth}>
      <AuthGuard>
        <Navbar />
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider>
          <Notifications />
          <AppContent>{children}</AppContent>
        </MantineProvider>
      </body>
    </html>
  );
}