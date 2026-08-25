import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'HELIOS — Autonomous Incident Command',
  description:
    'An AI-native command center for understanding and resolving production incidents in real time.',
  openGraph: {
    title: 'HELIOS — Autonomous Incident Command',
    description:
      'Trace the blast radius, explain the root cause, and safely resolve a production incident.',
    type: 'website',
    images: [{ url: '/og.png', width: 1536, height: 804, alt: 'HELIOS Autonomous Incident Command' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HELIOS — Autonomous Incident Command',
    description:
      'Trace the blast radius, explain the root cause, and safely resolve a production incident.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
