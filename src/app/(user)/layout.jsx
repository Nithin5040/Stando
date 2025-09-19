
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, History, User, Hourglass, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/activity', label: 'Activity', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
];

function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-t border-border/50 flex md:hidden z-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link href={item.href} key={item.label} className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors",
            isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          )}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function UserLayout({
  children,
}) {
  const { user, logout } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* This can be a loading spinner */}
        <p>Loading...</p> 
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed inset-0 h-full w-full bg-gradient-to-br from-primary/10 to-transparent -z-10" />

      {/* Desktop Header */}
      <header className="hidden md:flex justify-center border-b bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <Link href="/home" className="flex items-center gap-3">
              <div className="p-2.5 bg-background/50 backdrop-blur-sm border rounded-xl">
                <Hourglass className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground font-headline tracking-tight">Stando</h1>
            </Link>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/home" className="hover:text-foreground transition-colors">Home</Link>
                <Link href="/activity" className="hover:text-foreground transition-colors">Activity</Link>
             </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-primary/50 cursor-pointer">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} data-ai-hint="profile picture" alt="User Avatar" />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/activity">
                    <History className="mr-2 h-4 w-4" />
                    <span>Booking History</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pb-24 md:pb-10">
        {children}
      </main>

      <BottomNavBar />
      <footer className="hidden md:block py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Stando. All rights reserved.
      </footer>
    </div>
  );
}
