
'use client';

import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, CheckCircle, Clock, MapPin, MessageSquareText, Pin, Play, User, Briefcase, IndianRupee, MessageSquare, Phone, Loader2, Navigation, Compass, Users } from "lucide-react";
import { useEffect, useState, useMemo } from 'react';
import ChatDialog from '@/components/chat-dialog';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { searchLocations } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';

function QueueUpdater({ job, onUpdateQueue }) {
  const [position, setPosition] = useState(job.queuePosition || '');
  const [total, setTotal] = useState(job.totalInQueue || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await onUpdateQueue(job.id, parseInt(position), parseInt(total));
    setIsUpdating(false);
  }

  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Update Queue Status</h4>
        <div className="flex items-center gap-3">
            <Input 
                type="number" 
                placeholder="Your Pos." 
                className="bg-background/50 h-9"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
            />
            <span className="text-muted-foreground">of</span>
            <Input 
                type="number" 
                placeholder="Total" 
                className="bg-background/50 h-9"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
            />
        </div>
        <Button size="sm" className="w-full" onClick={handleUpdate} disabled={isUpdating || !position || !total}>
            {isUpdating ? <Loader2 className="animate-spin" /> : "Update for Customer"}
        </Button>
    </div>
  )
}


function JobCard({ job, onUpdateStatus, onVerifyLocation, onUpdateQueue }) {
  const { toast } = useToast();
  const getStatusVariant = (status) => {
    switch (status) {
      case 'In Progress': return 'default';
      case 'Queued': return 'secondary';
      default: return 'outline';
    }
  };
  
  const handleUpdateProgress = () => {
    if (job.status === 'Queued') {
      onUpdateStatus(job.id, 'In Progress');
      toast({ title: "Let's Go!", description: "The timer has started. You can now verify your location." });
    } else if (job.status === 'In Progress') {
      onUpdateStatus(job.id, 'Completed');
      toast({ title: "Job Done!", description: "Great work! Your payout has been calculated." });
    }
  };

  const handleVerify = () => {
    onVerifyLocation(job.id);
    toast({ title: "Location Verified!", description: "You've confirmed you're at the right spot. Good to go!" });
  }

  return (
    <Card className="glass-card flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg md:text-xl font-headline">
          <span>{job.service}</span>
           <Badge variant={getStatusVariant(job.status)} className="capitalize">{job.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <p className="text-sm">{job.location}</p>
        </div>
        <div className="flex items-center text-sm gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{job.customer}</span>
          </div>
        </div>
        
        {job.instructions && (
            <div className="flex items-start gap-3 text-muted-foreground bg-muted/30 p-3 rounded-md">
                <MessageSquareText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-foreground/90 text-xs">Customer Instructions</p>
                    <p className="text-xs">{job.instructions}</p>
                </div>
            </div>
        )}
        
        {job.status === 'In Progress' && job.locationVerified && <QueueUpdater job={job} onUpdateQueue={onUpdateQueue} />}

        <div className="flex-grow" />

        {job.status === 'In Progress' && !job.locationVerified && (
            <Button variant="outline" className="w-full mt-auto" onClick={handleVerify}>
                <Pin className="mr-2"/> Confirm Arrival
            </Button>
        )}
        {job.locationVerified && (
             <div className="flex items-center justify-center gap-2 text-xs text-green-400 bg-green-500/10 py-2 rounded-md mt-auto">
                <CheckCircle className="h-4 w-4" />
                <span>Location Verified</span>
            </div>
        )}

        <Button className="w-full mt-2" onClick={handleUpdateProgress} disabled={job.status === 'Completed' || (job.status === 'In Progress' && !job.locationVerified)}>
          {job.status === 'Queued' && <><Play className="mr-2"/> Start Job</>}
          {job.status === 'In Progress' && <><Check className="mr-2"/> Mark as Completed</>}
          {job.status === 'Completed' && 'Finished'}
        </Button>
      </CardContent>
       <CardFooter className="grid grid-cols-2 gap-2">
          <ChatDialog 
            trigger={
                <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" /> Chat
                </Button>
            }
            booking={job}
            currentUser="agent"
          />
        <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`tel:${job.customerPhone}`}>
                <Phone className="mr-2 h-4 w-4" /> Call
            </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function LocationUpdater() {
    const { agent, updateAgentLocation } = useStore();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        if (agent && agent.location) {
            // This is a bit of a hack to show the current location name.
            // A real app would use reverse geocoding.
            setSearchQuery(`Current: Lat ${agent.location.lat}, Lng ${agent.location.lng}`);
        }
    }, [agent])

    useEffect(() => {
        if (debouncedSearchQuery.length > 2 && !selectedLocation) {
            const performSearch = async () => {
                setIsSearching(true);
                const results = await searchLocations(debouncedSearchQuery);
                setSearchResults(results);
                setIsSearching(false);
                setShowResults(true);
            };
            performSearch();
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [debouncedSearchQuery, selectedLocation]);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setSearchQuery(location.display_name);
        setShowResults(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (selectedLocation) {
            setSelectedLocation(null);
        }
    };

    const handleUpdate = async () => {
        if (!selectedLocation) {
            toast({ variant: 'destructive', title: 'No Location Selected', description: 'Please search for and select a new location first.' });
            return;
        }
        await updateAgentLocation(agent.id, parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon));
        toast({ title: 'Location Updated!', description: 'You will now receive requests based on your new location.' });
        setSelectedLocation(null);
    };

    if (!agent) return null;

    return (
        <Card className="glass-card border-primary/30 mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline">
                    <Navigation className="text-primary"/>
                    <span>Update Your Location</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="text-sm text-muted-foreground">
                    Your location is used to show you nearby job requests. Keep it updated to see relevant tasks.
                </div>
                <div className="grid gap-2 relative">
                    <Input
                        placeholder="Search for your current area..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoComplete="off"
                    />
                    {showResults && (
                        <div className="absolute top-full mt-1 w-full bg-card border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                            {isSearching && <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</div>}
                            {!isSearching && searchResults.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>}
                            {searchResults.map((loc) => (
                                <div key={`${loc.lat}-${loc.lon}`} className="p-3 text-sm hover:bg-muted cursor-pointer flex items-start gap-2" onClick={() => handleLocationSelect(loc)}>
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <span className="flex-1">{loc.display_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Button className="w-full" onClick={handleUpdate} disabled={!selectedLocation || isSearching}>Set My Location</Button>
            </CardContent>
        </Card>
    )
}

function StatCard({ title, value, icon: Icon }) {
    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}

// Helper function to calculate distance between two lat/lng points in KM
const getDistance = (lat1, lon1, lat2, lon2) => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    } else {
        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;
        const theta = lon1 - lon2;
        const radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344 // convert to KM
        return dist;
    }
}

function NearbyRequestCard({ job, distance, onAccept }) {
    const { toast } = useToast();
    const [isAccepting, setIsAccepting] = useState(false);
    
    const handleAccept = async () => {
        setIsAccepting(true);
        const success = await onAccept(job.id);
        if (success) {
            toast({ title: 'Job Accepted!', description: 'The job has been added to your assigned list.' });
        } else {
            toast({ variant: 'destructive', title: 'Failed to Accept', description: 'This job may have already been taken by another agent.' });
        }
        setIsAccepting(false);
    }
    
    return (
        <Card className="glass-card">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 flex-1">
                        <h3 className="font-semibold">{job.service}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                           <MapPin className="h-4 w-4" /> {job.location}
                        </p>
                         <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                           <Clock className="h-4 w-4" /> Requested {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                         <Badge variant="outline" className="flex items-center gap-2">
                            <Compass className="h-3 w-3" />
                            {distance.toFixed(1)} km away
                        </Badge>
                        <Button className="w-full sm:w-auto" size="sm" onClick={handleAccept} disabled={isAccepting}>
                           {isAccepting ? <Loader2 className="animate-spin" /> : 'Accept Job'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AgentDashboardPage() {
  const { agent, bookings, updateBookingStatus, fetchBookings, isLoading, verifyLocation, acceptBooking, updateQueueInfo } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000); // Poll for new jobs every 5 seconds
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const { assignedJobs, completedJobs, nearbyPendingJobs, totalPayout } = useMemo(() => {
    if (!agent) {
      return { assignedJobs: [], completedJobs: [], nearbyPendingJobs: [], totalPayout: 0 };
    }

    const assigned = bookings.filter(j => j.agent?.id === agent.id && j.status !== 'Completed' && j.status !== 'Cancelled');
    const completed = bookings.filter(j => j.agent?.id === agent.id && j.status === 'Completed');
    const payout = completed.reduce((sum, job) => sum + (Number(job.agentPayout) || 0), 0);

    const pending = bookings
      .filter(j => j.status === 'Pending' && j.latitude && j.longitude)
      .map(job => ({
        ...job,
        distance: getDistance(agent.location.lat, agent.location.lng, job.latitude, job.longitude)
      }))
      .filter(job => job.distance < 20) // Only show jobs within a 20km radius
      .sort((a, b) => a.distance - b.distance); 

    return { assignedJobs: assigned, completedJobs: completed, nearbyPendingJobs: pending, totalPayout: payout };
  }, [bookings, agent]);


  if (!agent) {
      return (
         <div className="flex justify-center items-center h-screen">
             <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading dashboard...</p>
             </div>
        </div>
      )
  }

  const handleVerifyLocation = (bookingId) => {
    verifyLocation(bookingId);
  }

  const handleUpdateQueue = async (bookingId, queuePosition, totalInQueue) => {
      try {
        await updateQueueInfo(bookingId, queuePosition, totalInQueue);
        toast({ title: 'Queue Updated', description: 'The customer has been notified of their position.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update queue info.' });
      }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {agent.name}!</p>
      </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard title="Nearby Requests" value={nearbyPendingJobs.length.toString()} icon={MapPin} />
            <StatCard title="Active Jobs" value={assignedJobs.length.toString()} icon={Briefcase} />
            <StatCard title="Jobs Completed Today" value={completedJobs.length.toString()} icon={CheckCircle} />
            <StatCard title="Total Payout" value={`₹${totalPayout.toFixed(2)}`} icon={IndianRupee} />
        </section>

        <LocationUpdater />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold font-headline">Nearby Requests</h2>
                </div>
                 {nearbyPendingJobs.length > 0 ? (
                    <div className="space-y-4">
                        {nearbyPendingJobs.map(job => (
                            <NearbyRequestCard key={job.id} job={job} distance={job.distance} onAccept={acceptBooking} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-12 border-dashed glass-card border-white/10">
                        <p className="text-muted-foreground">No pending requests in your area. We'll notify you when a new job comes in!</p>
                    </Card>
                )}
            </section>
            
            <section>
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold font-headline">My Assigned Jobs</h2>
                </div>
                {assignedJobs.length > 0 ? (
                <div className="space-y-6">
                    {assignedJobs.map(job => (
                        <JobCard key={job.id} job={job} onUpdateStatus={updateBookingStatus} onVerifyLocation={handleVerifyLocation} onUpdateQueue={handleUpdateQueue}/>
                    ))}
                </div>
                ) : (
                <Card className="text-center p-12 border-dashed glass-card border-white/10">
                    <p className="text-muted-foreground">You have no active jobs. Accept a nearby request to get started!</p>
                </Card>
                )}
            </section>
        </div>
    </div>
  );
}

    
