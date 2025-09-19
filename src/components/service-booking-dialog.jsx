
'use client';

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { searchLocations } from "@/app/actions";
import { Loader2, MapPin, Wand2 } from "lucide-react";
import { useDebounce } from "use-debounce";

const serviceMap = {
  "Temples": "Temple Darshan",
  "Hospitals": "Hospital/Clinic",
  "Govt. Offices": "Govt. Office",
  "Shopping": "Shopping",
  "Others": "Other",
};

const serviceOptions = [
  { value: "Temple Darshan", label: "Temple Darshan" },
  { value: "Hospital/Clinic", label: "Hospital/Clinic" },
  { value: "Govt. Office", label: "Govt. Office" },
  { value: "Bank", label: "Bank" },
  { value: "RTO Office", label: "RTO Office" },
  { value: "Passport Office", label: "Passport Office" },
  { value: "Shopping", label: "Shopping" },
  { value: "Other", label: "Other" },
];

export default function ServiceBookingDialog({ children, onConfirm, initialService }) {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState(initialService ? serviceMap[initialService] || '' : '');
  const [instructions, setInstructions] = useState('');
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const childElement = React.Children.only(children);
  const isDisabled = childElement.props.disabled;
  
  const resetDialog = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
        setService(initialService ? serviceMap[initialService] || '' : '');
        setInstructions('');
        setSearchQuery('');
        setSelectedLocation(null);
        setSearchResults([]);
        setShowResults(false);
    }, 300);
  }, [initialService]);


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
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (selectedLocation) {
      setSelectedLocation(null);
    }
  }

  const handleRequestAgent = () => {
    if (!service || !selectedLocation) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a service and search for a location.",
      });
      return;
    }
    
    onConfirm(service, selectedLocation.display_name, instructions, parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon));
    
    toast({
        title: "Request Sent!",
        description: "We're dispatching the nearest agent to you. Check the Active Booking card for updates.",
    });

    resetDialog();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetDialog(); else if (!isDisabled) setOpen(true); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-xl border-border/50">
        <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Book a Queue Buster</DialogTitle>
            <DialogDescription>
            Fill in the details below. We'll automatically assign the closest agent for you.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="service-type">Service</Label>
                <Select value={service} onValueChange={setService}>
                    <SelectTrigger id="service-type">
                        <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                        {serviceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="location-search">Location</Label>
              <Input
                id="location-search"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoComplete="off"
              />
              {showResults && (
                <div className="absolute top-full mt-1 w-full bg-card border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {isSearching && <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Searching...</div>}
                  {!isSearching && searchResults.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>}
                  {searchResults.map((loc) => (
                    <div
                      key={`${loc.lat}-${loc.lon}`}
                      className="p-3 text-sm hover:bg-muted cursor-pointer flex items-start gap-2"
                      onClick={() => handleLocationSelect(loc)}
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="flex-1">{loc.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
             <div className="grid gap-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea 
                    id="instructions" 
                    value={instructions} 
                    onChange={(e) => setInstructions(e.target.value)} 
                    placeholder="e.g., Please call me when you are 5 minutes away."
                />
            </div>
        </div>
        <DialogFooter>
            <Button onClick={handleRequestAgent} type="submit" className="w-full" disabled={!selectedLocation || !service}>
              <Wand2 className="mr-2" /> Find My Queue Buster
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
