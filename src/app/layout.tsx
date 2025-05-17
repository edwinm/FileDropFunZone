import type {Metadata} from 'next';
import { Comic_Neue } from 'next/font/google'; // Changed font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const comicNeue = Comic_Neue({ // New playful font
  variable: '--font-comic-neue',
  subsets: ['latin'],
  weight: ['300', '400', '700'], // Light, Regular, Bold
});

export const metadata: Metadata = {
  title: 'FileDrop FunZone!', // Updated title
  description: 'Drag, drop, and explore your files with a playful twist!', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${comicNeue.variable} font-sans antialiased`}> {/* Apply new font */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
