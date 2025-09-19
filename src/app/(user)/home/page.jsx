
'use client';

import { useStore } from '@/lib/store';
import { ArrowRight, Building2, Hospital, Hourglass, Landmark, MoreHorizontal, ShoppingCart, Loader2, CheckCircle, Smile, UserCheck, IndianRupee } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ActiveBookingCard from '@/components/active-booking-card';
import ServiceBookingDialog from "@/components/service-booking-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


export default function HomePage() {
  const { user, bookings, addBooking, fetchBookings } = useStore();
  const [activeBooking, setActiveBooking] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [justCompletedBooking, setJustCompletedBooking] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && user === null) {
      router.push('/login');
    }
  }, [user, router, isClient]);
  
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  useEffect(() => {
    const active = bookings.find(b => b.status !== 'Completed' && b.status !== 'Cancelled');
    
    // Check if an active booking just got completed
    if (activeBooking && !active && activeBooking.status !== 'Completed') {
        const completedBooking = bookings.find(b => b.id === activeBooking.id);
        if (completedBooking) {
            setJustCompletedBooking(completedBooking);
            setShowCompletionDialog(true);
        }
    }
    
    setActiveBooking(active || null);
  }, [bookings, activeBooking]);


  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchBookings();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user, fetchBookings]);


  const serviceCategories = [
    { name: "Temple Darshan", description: "Seek blessings without the long wait.", icon: Landmark },
    { name: "Hospital Visits", description: "Focus on health, not the queue.", icon: Hospital },
    { name: "Govt. Offices", description: "Handle paperwork efficiently.", icon: Building2 },
    { name: "Event Tickets", description: "Get your spot for the next big thing.", icon: ShoppingCart },
    { name: "Anything Else", description: "If there's a line, we can be in it.", icon: MoreHorizontal },
  ];

  const howItWorksSteps = [
    {
        icon: UserCheck,
        title: "1. Book Your Spot",
        description: "Tell us what you need and where. We'll find the perfect agent for the job."
    },
    {
        icon: Smile,
        title: "2. Relax & Track",
        description: "Your agent will stand in line for you. Get live photo updates and chat anytime."
    },
    {
        icon: CheckCircle,
        title: "3. Arrive & Complete",
        description: "We'll notify you when it's your turn. Just arrive, complete your task, and go!"
    }
  ]

  const handleBookingRequest = (service, location, instructions, latitude, longitude) => {
    addBooking({
      service,
      location,
      instructions,
      latitude,
      longitude,
    });
  };

  const handlePayment = (method) => {
    setShowCompletionDialog(false);
    toast({
        title: `Payment via ${method}`,
        description: `Thanks for using Stando! Your payment of ₹${justCompletedBooking?.finalCost?.toFixed(2)} is confirmed.`,
    });
  }
  
  if (!isClient || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <header className="flex md:hidden justify-between items-center mb-6 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center gap-3">
            <Link href="/home" className="flex items-center gap-3">
              <div className="p-2.5 bg-background/50 backdrop-blur-sm border rounded-xl">
                <Hourglass className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground font-headline tracking-tight">Stando</h1>
            </Link>
          </div>
      </header>

      <div className={cn("container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8", activeBooking ? "md:pt-10" : "md:pt-0")}>
        {activeBooking ? (
            <section className="mb-10">
            <ActiveBookingCard booking={activeBooking} />
            </section>
        ) : (
          <>
            <section className="relative text-center py-20 md:py-32 lg:py-40 rounded-3xl overflow-hidden mb-12 md:mb-20">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <Image src="https://picsum.photos/seed/city-freedom/1200/800" data-ai-hint="person relaxing city" alt="Person relaxing" fill className="object-cover" />
                <div className="relative z-20 flex flex-col items-center px-4">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-4 text-white shadow-lg">Your time is priceless.</h2>
                    <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">Aap chill karo, hum line mein khade hain. Get your tasks done without the wait.</p>
                    <ServiceBookingDialog onConfirm={handleBookingRequest}>
                        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl shadow-accent/20 h-12 px-8 text-base">
                            Book a Queue Buster <ArrowRight className="ml-2" />
                        </Button>
                    </ServiceBookingDialog>
                </div>
            </section>

             <section className="mb-12 md:mb-20">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold font-headline">How It Works</h3>
                    <p className="text-muted-foreground mt-2">Get your time back in three simple steps.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                {howItWorksSteps.map((step) => (
                    <div key={step.title} className="text-center flex flex-col items-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 text-primary mb-4">
                            <step.icon className="h-8 w-8" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                        <p className="text-muted-foreground max-w-xs">{step.description}</p>
                    </div>
                ))}
                </div>
            </section>

            <section className="mb-10">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold font-headline">What can we wait for?</h3>
                    <p className="text-muted-foreground mt-2">Perfect for any situation where there's a queue.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceCategories.map((category) => (
                    <ServiceBookingDialog key={category.name} onConfirm={handleBookingRequest} initialService={category.name}>
                        <button className="w-full h-full text-left">
                            <Card className="glass-card h-full hover:border-accent/80 transition-all duration-300 hover:shadow-accent/10 hover:shadow-2xl hover:-translate-y-1">
                                <CardHeader className="flex-row items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <category.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{category.name}</CardTitle>
                                        <CardDescription>{category.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </button>
                    </ServiceBookingDialog>
                ))}
                </div>
            </section>
          </>
        )}
      </div>

       {justCompletedBooking && (
         <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
            <AlertDialogContent className="glass-card">
                <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl md:text-3xl font-headline text-center">Mission Accomplished!</AlertDialogTitle>
                <AlertDialogDescription className="text-center pt-2">
                    Your agent has completed the task for "{justCompletedBooking.service}".
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="text-center p-4 my-4 rounded-lg bg-background/50">
                    <p className="text-muted-foreground">Final Bill</p>
                    <p className="text-5xl font-bold font-headline text-foreground">
                        <IndianRupee className="inline h-10 w-10 -mt-2" />
                        {justCompletedBooking.finalCost ? justCompletedBooking.finalCost.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">Based on a {justCompletedBooking.durationMinutes} minute job.</p>
                </div>
                <AlertDialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    <Button size="lg" onClick={() => handlePayment('UPI')} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Pay with UPI
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => handlePayment('Cash')}>
                        Pay with Cash
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
