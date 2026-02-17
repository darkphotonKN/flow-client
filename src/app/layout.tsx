import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import LayoutContent from '@/components/LayoutContent';

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: 'Flow - Your Learning & Development Hub',
  description:
    'Organize your learning journey and development projects in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={merriweather.variable}>
      <body className={merriweather.className}>
        <LayoutWrapper>
          <LayoutContent>{children}</LayoutContent>
        </LayoutWrapper>
      </body>
    </html>
  );
}
