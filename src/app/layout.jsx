
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Stando',
  description: 'Aap chill karo, hum line mein khade hain.',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn("font-body antialiased", inter.variable, poppins.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
