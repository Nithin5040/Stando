
'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Wallet, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';


export default function AgentHistoryPage() {
  const { bookings, fetchBookings, isLoading } = useStore();
  const [completedJobs, setCompletedJobs] = useState([]);
  const agentId = 'AGENT001'; // Hardcoded for this demo for Ravi Kumar
  
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  useEffect(() => {
    const agentCompleted = bookings.filter(j => j.agent?.id === agentId && j.status === 'Completed');
    setCompletedJobs(agentCompleted);
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }


  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <header className="flex md:hidden justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">Job History</h1>
      </header>

      <section>
          <h2 className="text-2xl font-bold font-headline mb-6 hidden md:block">My Completed Jobs</h2>
            {completedJobs.length > 0 ? (
              <div className="space-y-4">
                  {completedJobs.map(job => (
                      <Card key={job.id} className="bg-card/70 backdrop-blur-lg border-border/50">
                          <CardContent className="pt-6">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="space-y-1">
                                      <h3 className="font-semibold">{job.service} - <span className="text-muted-foreground font-normal">{job.id}</span></h3>
                                      <p className="text-sm text-muted-foreground">{job.location} &bull; Customer: {job.customer}</p>
                                      {job.agentPayout && job.durationMinutes && (
                                        <div className="flex items-center pt-2 gap-2 text-sm">
                                            <Wallet className="h-4 w-4 text-primary" />
                                            <span className="text-muted-foreground">Payout:</span>
                                            <span className="font-bold text-foreground">₹{job.agentPayout.toFixed(2)}</span>
                                            <span className="text-xs text-muted-foreground">({job.durationMinutes} mins)</span>
                                        </div>
                                      )}
                                  </div>
                                  <div className="flex items-center gap-2 text-green-500 self-end sm:self-center">
                                    <CheckCircle className="h-5 w-5"/>
                                    <span className="text-sm font-semibold">Completed</span>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>
            ) : (
                <Card className="text-center p-12 border-dashed bg-card/50 backdrop-blur-lg">
                 <p className="text-muted-foreground">No jobs completed yet. Let's get to work!</p>
               </Card>
            )}
        </section>
    </div>
  )
}
