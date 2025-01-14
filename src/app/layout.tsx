import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Healthcare Advocates',
  description: 'Find and connect with healthcare advocates based on specialties, location, and experience.',
  keywords: ['healthcare', 'advocates', 'medical', 'specialists', 'doctors', 'search'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
