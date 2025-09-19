
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hourglass, Loader2 } from "lucide-react";
import Link from "next/link";
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back! Let's get you out of a queue.",
      });
      router.push('/home');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your email and password and try again.",
      });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed inset-0 h-full w-full bg-gradient-to-br from-primary/10 to-transparent -z-10" />
      <header className="absolute top-0 w-full p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2.5 bg-background/50 backdrop-blur-sm border rounded-xl">
                <Hourglass className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground font-headline tracking-tight">Stando</h1>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl bg-card/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Customer Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 items-stretch">
            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign in'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                Don't have an account? <Link href="/signup" className="underline text-foreground/80 hover:text-foreground">Sign up</Link>
            </div>

             <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
                <Link href="/agent/login">Login as Agent</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
