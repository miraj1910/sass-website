import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SonnerToaster from "@/components/sonner-toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PulseDesk',
  description: 'Social Media Analytics SaaS Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SonnerToaster />
      </body>
    </html>
  );
}
