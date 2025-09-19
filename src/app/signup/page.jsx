
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

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async () => {
    setIsLoading(true);
    const success = await signup(name, email, password);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Signup Successful!",
        description: "Your account has been created. Welcome!",
      });
      router.push('/home');
    } else {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "An account with this email may already exist, or the server encountered an error.",
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
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>
              Join Stando today to skip the queue and save time.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Priya Sharma" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="priya@example.com" 
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
                onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 items-stretch">
            <Button className="w-full" onClick={handleSignup} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="underline text-foreground/80 hover:text-foreground">Log in</Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
