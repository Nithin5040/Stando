
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Landmark, Loader2, Wallet, MessageSquareText, Phone, MessageSquare, IndianRupee, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ChatDialog from './chat-dialog';
import { Button } from './ui/button';
import Link from 'next/link';

export default function ActiveBookingCard({ booking }) {

    if (booking.status === 'Pending') {
        return (
             <Card className="glass-card max-w-2xl mx-auto">
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

    const showQueueInfo = booking.status === 'In Progress' && booking.locationVerified && booking.queuePosition && booking.totalInQueue;

    return (
        <Card className="glass-card max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex justify-between items-center text-xl md:text-2xl font-headline">
                <span>Your Booking is Active!</span>
                </CardTitle>
                <CardDescription>Agent {booking.agent.name} is on the case! (Booking ID: {booking.id})</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start space-x-4 mb-6">
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

                    {showQueueInfo && (
                         <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
                            <Users className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="font-bold text-foreground">You are number {booking.queuePosition} in a queue of {booking.totalInQueue}.</span>
                        </div>
                    )}

                    {booking.estimatedCost && (
                        <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md border border-border">
                            <Wallet className="h-4 w-4 text-primary" />
                            <span>Base fare starts at: <span className="font-bold text-foreground">₹{booking.estimatedCost.toFixed(2)}</span></span>
                        </div>
                    )}

                    {booking.instructions && (
                        <div className="flex items-start gap-3 text-muted-foreground bg-muted/30 p-3 rounded-md border border-border">
                            <MessageSquareText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground/90 text-xs uppercase tracking-wider">Your Instructions</p>
                                <p className="text-sm">{booking.instructions}</p>
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
