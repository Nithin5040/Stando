
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Landmark, Loader2, Wallet, MessageSquareText, Phone, MessageSquare, IndianRupee } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ChatDialog from './chat-dialog';
import { Button } from './ui/button';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";


export default function ActiveBookingCard({ booking }) {
    const { toast } = useToast();

    if (booking.status === 'Pending') {
        return (
             <Card className="bg-card/70 backdrop-blur-lg border-border/50">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-xl font-headline">
                        Finding your hero...
                    </CardTitle>
                    <CardDescription>Hold tight! We're searching the area for the best agent for your task at "{booking.location}".</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center p-8">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Scanning for available Queue Busters...</p>
                </CardContent>
            </Card>
        )
    }

    if (!booking.agent) return null;

    const handlePayment = (method) => {
        toast({
            title: `Payment ${method}`,
            description: "In a real app, this would open a payment gateway. For now, consider it paid. Thanks for using Stando!",
        });
    }

    if (booking.status === 'Completed') {
        return (
            <Card className="bg-gradient-to-br from-primary/20 via-card/70 to-card/70 backdrop-blur-lg border-primary/30">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-xl md:text-2xl font-headline">
                        Mission Accomplished!
                    </CardTitle>
                    <CardDescription>Your work at "{booking.service}" is complete. Time to celebrate!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-4 rounded-lg bg-background/50">
                        <p className="text-muted-foreground">Final Bill</p>
                        <p className="text-5xl font-bold font-headline text-foreground">
                            <IndianRupee className="inline h-10 w-10 -mt-2" />
                            {booking.finalCost.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Based on a {booking.durationMinutes} minute job.</p>
                    </div>
                </CardContent>
                <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    <Button size="lg" onClick={() => handlePayment('UPI')}>
                        Pay with UPI
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => handlePayment('Cash')}>
                        Pay with Cash
                    </Button>
                </CardFooter>
            </Card>
        )
    }


    return (
        <Card className="bg-card/70 backdrop-blur-lg border-border/50">
            <CardHeader>
                <CardTitle className="flex justify-between items-center text-xl md:text-2xl font-headline">
                <span>Your Booking is Active!</span>
                </CardTitle>
                <CardDescription>Agent {booking.agent.name} is on the case! (Booking ID: {booking.id})</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start space-x-4 mb-4">
                <div className="p-3 sm:p-4 bg-primary/10 rounded-lg mt-1">
                    <Landmark className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-base sm:text-lg">{booking.service}</h3>
                    <p className="text-sm text-muted-foreground">{booking.location}</p>
                </div>
                </div>
                <div className="text-sm space-y-4">
                <p><strong>Agent:</strong> {booking.agent.name} (arriving in {booking.agent.eta})</p>
                 {booking.estimatedCost && (
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 p-2 rounded-md">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span>Base fare starts at: <span className="font-bold text-foreground">₹{booking.estimatedCost.toFixed(2)}</span></span>
                    </div>
                 )}
                 {booking.instructions && (
                     <div className="flex items-start gap-3 text-muted-foreground bg-muted/50 p-3 rounded-md">
                        <MessageSquareText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground/90 text-xs">Your Instructions</p>
                            <p className="text-xs">{booking.instructions}</p>
                        </div>
                    </div>
                 )}
                <div>
                    <div className="flex justify-between mb-1.5">
                    <p><strong>Status: </strong> {booking.status}</p>
                    <p className="font-semibold text-primary">{booking.progress}%</p>
                    </div>
                    <Progress value={booking.progress} className="h-2" />
                     <p className="text-xs text-muted-foreground pt-1">
                        {booking.status === 'Queued' && 'Agent is on their way.'}
                        {booking.status === 'In Progress' && !booking.locationVerified && 'Agent has started the job timer.'}
                        {booking.status === 'In Progress' && booking.locationVerified && 'Agent has arrived and confirmed their location.'}
                    </p>
                </div>
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-3 pt-4">
                 <ChatDialog 
                    trigger={
                        <Button variant="outline" className="w-full">
                            <MessageSquare className="mr-2" /> Chat with Agent
                        </Button>
                    }
                    booking={booking}
                    currentUser="customer"
                />
                <Button asChild className="w-full">
                    <Link href={`tel:${booking.agent.phone}`}>
                        <Phone className="mr-2" /> Call Agent
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
