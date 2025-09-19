
'use client';

import { useStore } from '@/lib/store';
import ActiveBookingCard from '@/components/active-booking-card';
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Wallet, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';

export default function ActivityPage() {
  const { user, bookings, fetchBookings, isLoading } = useStore();
  const [activeBooking, setActiveBooking] = useState(null);
  const [completedBookings, setCompletedBookings] = useState([]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  useEffect(() => {
    if (user) {
        const interval = setInterval(() => {
            fetchBookings();
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }
  }, [user, fetchBookings]);


  useEffect(() => {
    const active = bookings.find(b => b.status !== 'Completed' && b.status !== 'Cancelled');
    const completed = bookings.filter(b => b.status === 'Completed');
    
    setActiveBooking(active || null);
    setCompletedBookings(completed);
  }, [bookings]);

  if (isLoading && !activeBooking && completedBookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="py-8 md:py-10">
       <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="flex md:hidden justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">Activity</h1>
        </header>

        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold font-headline mb-4">Active Booking</h2>
          {activeBooking ? (
              <ActiveBookingCard booking={activeBooking} />
          ) : (
              <Card className="text-center p-12 border-dashed bg-card/30 backdrop-blur-lg border-white/5">
                  <p className="text-muted-foreground">You have no active bookings. Time to chill!</p>
              </Card>
          )}
        </section>

        <section>
              <h2 className="text-xl md:text-2xl font-bold font-headline mb-6">Booking History</h2>
              {completedBookings.length > 0 ? (
                  <div className="space-y-4">
                  {completedBookings.map(job => (
                      <Card key={job.id} className="glass-card">
                      <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="space-y-1">
                                  <h3 className="font-semibold">{job.service} - <span className="text-muted-foreground font-normal">{job.id}</span></h3>
                                  <p className="text-sm text-muted-foreground">{job.location} &bull; Agent: {job.agent?.name}</p>
                                  {job.finalCost && (
                                      <div className="flex items-center pt-2 gap-2 text-sm">
                                          <Wallet className="h-4 w-4 text-primary" />
                                          <span className="text-muted-foreground">Final Cost:</span>
                                          <span className="font-bold text-foreground">₹{job.finalCost.toFixed(2)}</span>
                                          <span className="text-xs text-muted-foreground">({job.durationMinutes} mins)</span>
                                      </div>
                                  )}
                              </div>
                              <div className="flex items-center gap-2 text-green-400 self-end sm:self-center">
                                  <UserCheck className="h-5 w-5"/>
                                  <span className="text-sm font-semibold">Completed</span>
                              </div>
                          </div>
                      </CardContent>
                      </Card>
                  ))}
                  </div>
              ) : (
                  <Card className="text-center p-12 border-dashed bg-card/30 backdrop-blur-lg border-white/5">
                      <p className="text-muted-foreground">No tales of triumph just yet. Complete a job to see it here!</p>
                  </Card>
              )}
          </section>
      </div>
    </div>
  )
}
