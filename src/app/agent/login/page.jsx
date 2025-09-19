

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';

export default function AgentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { agentLogin } = useStore();

  const handleLogin = async () => {
    setIsLoading(true);
    const success = await agentLogin(email, password);
    setIsLoading(false);

    if (success) {
      toast({ title: "Login Successful", description: `Welcome back!`});
      router.push('/agent/dashboard');
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Please check your credentials and try again." });
    }
  };


  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl bg-card/80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Agent Login</CardTitle>
          <CardDescription>
            Enter your agent credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              placeholder="agent@example.com" 
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
              New agent? <Link href="/agent/onboarding" className="underline text-foreground/80 hover:text-foreground">Create Agent Account</Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}

    