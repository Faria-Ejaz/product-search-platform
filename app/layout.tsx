import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Product Search Platform',
  description: 'Search through thousands of premium supplements and wellness products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
