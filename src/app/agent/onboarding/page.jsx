
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ArrowRight, User, Phone, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = 'http://localhost:5001/api';

export default function AgentOnboardingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async () => {
      setIsLoading(true);
      try {
          const response = await fetch(`${API_BASE_URL}/agents/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, phone, password }),
          });

          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.message || 'Something went wrong');
          }
          
          toast({
              title: "Welcome Aboard!",
              description: "Your agent account is ready. Time to start earning.",
          });
          setIsSuccess(true);

      } catch (error) {
          toast({
              variant: "destructive",
              title: "Registration Failed",
              description: error.message,
          });
      } finally {
          setIsLoading(false);
      }
  };

  const handleFinish = () => {
    router.push('/agent/login');
  }

  if (isSuccess) {
    return (
       <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl bg-card/80 backdrop-blur-lg">
            <CardContent className="pt-6">
                 <div className="flex items-center gap-6 text-center flex-col py-4">
                    <div className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-green-500 bg-green-500/10 text-green-500">
                        <CheckCircle className="h-10 w-10"/>
                    </div>
                    <div className="flex-1 pt-2">
                        <h3 className="text-2xl font-bold font-headline mb-2">You're All Set!</h3>
                        <p className="text-muted-foreground">Your account has been created. You can now log in to the agent dashboard.</p>
                        <Button className="mt-6" size="lg" onClick={handleFinish}>
                            Go to Agent Login <ArrowRight className="ml-2"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl bg-card/80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Become a Queue Buster!</CardTitle>
            <CardDescription>
            Complete the form below to start earning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Ravi Kumar" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="ravi@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Set Your Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full !mt-6" onClick={handleRegister} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Create My Agent Account'}
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">Already have an account? <Link href="/agent/login" className="underline hover:text-foreground">Log In</Link></p>
        </CardFooter>
      </Card>
    </main>
  );
}
