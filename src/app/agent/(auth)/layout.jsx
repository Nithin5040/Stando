
import Link from 'next/link';
import { Hourglass } from 'lucide-react';

export default function AuthLayout({
  children,
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed inset-0 h-full w-full bg-gradient-to-br from-primary/10 to-transparent -z-10" />
      <header className="w-full container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/login" className="flex items-center gap-3">
            <div className="p-2.5 bg-background/50 backdrop-blur-sm border rounded-xl">
                <Hourglass className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline tracking-tight">Stando Agent</h1>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start md:justify-center p-4">
        {children}
      </main>
    </div>
  );
}
