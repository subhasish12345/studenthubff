
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Ticket, Users, Calendar, MapPin, MoreHorizontal, Loader2, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Event, addEvent, getEvents, updateEvent, deleteEvent, EventType } from '@/services/events';

const Countdown = ({ toDate }: { toDate: Date }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(toDate) - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents: any[] = [];
  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="text-center">
        <div className="text-2xl font-bold font-mono">{(timeLeft as any)[interval].toString().padStart(2, '0')}</div>
        <div className="text-xs uppercase text-muted-foreground">{interval}</div>
      </div>
    );
  });
  
  return (
    <div className="flex gap-4">
      {timerComponents.length ? timerComponents : <span>Event has started!</span>}
    </div>
  );
};

function EventCard({ event, onEdit, onDelete, onView }: { event: Event, onEdit: () => void, onDelete: () => void, onView: () => void }) {
  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow relative">
       <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onView}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                <DropdownMenuItem onSelect={onEdit}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      <div className="relative h-48 w-full">
        <Image src={event.image} alt={event.title} fill style={{ objectFit: 'cover' }} data-ai-hint={event.aiHint} />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2">
           <Badge variant="outline">{event.type}</Badge>
        </div>
        <CardTitle className="font-headline pt-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div>
          <Countdown toDate={new Date(event.date)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Ticket className="mr-2 h-4 w-4" />
          RSVP Now
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddEditEventDialog({ mode, event, onEventUpdated }: { mode: 'add' | 'edit', event?: Event, onEventUpdated: () => void }) {
    const [title, setTitle] = useState(event?.title || '');
    const [type, setType] = useState<EventType | ''>(event?.type || '');
    const [date, setDate] = useState(event ? new Date(event.date).toISOString().split('T')[0] : '');
    const [location, setLocation] = useState(event?.location || '');
    const [image, setImage] = useState(event?.image || '');
    const [aiHint, setAiHint] = useState(event?.aiHint || '');
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const dialogTitle = mode === 'add' ? 'Create New Event' : 'Edit Event';
    const buttonText = mode === 'add' ? 'Create Event' : 'Save Changes';

    useEffect(() => {
        if(open) {
            setTitle(event?.title || '');
            setType(event?.type || '');
            setDate(event ? new Date(event.date).toISOString().split('T')[0] : '');
            setLocation(event?.location || '');
            setImage(event?.image || 'https://placehold.co/600x400');
            setAiHint(event?.aiHint || '');
        }
    }, [open, event]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !type || !date || !location || !image) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
            return;
        }
        setIsLoading(true);

        const eventData: Omit<Event, 'id'> = {
            title,
            type,
            date: new Date(date).getTime(),
            location,
            image,
            aiHint
        };

        try {
            if (mode === 'add') {
                await addEvent(eventData);
                toast({ title: 'Success', description: 'Event created successfully.' });
            } else if (event) {
                await updateEvent(event.id, eventData);
                toast({ title: 'Success', description: 'Event updated successfully.' });
            }
            onEventUpdated();
            setOpen(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `An unknown error occurred.`;
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'add' ? (
                     <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                    </Button>
                ) : (
                    <span />
                )}
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Event Type</Label>
                                <Select onValueChange={v => setType(v as EventType)} value={type}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Competition">Competition</SelectItem>
                                        <SelectItem value="Workshop">Workshop</SelectItem>
                                        <SelectItem value="Social">Social</SelectItem>
                                        <SelectItem value="Academic">Academic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="location">Location / Venue</Label>
                            <Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input id="image" value={image} onChange={e => setImage(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="aiHint">AI Image Hint (1-2 words)</Label>
                            <Input id="aiHint" value={aiHint} onChange={e => setAiHint(e.target.value)} placeholder="e.g. tech conference"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {buttonText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteEventDialog({ event, onEventDeleted, open, onOpenChange }: { event: Event, onEventDeleted: () => void, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteEvent(event.id);
            toast({ title: "Success", description: "Event deleted successfully." });
            onEventDeleted();
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: `Failed to delete event: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the event "{event.title}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const { toast } = useToast();

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const eventsData = await getEvents();
            setEvents(eventsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch events.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleEdit = (event: Event) => {
        setSelectedEvent(event);
        setIsEditOpen(true);
    };

    const handleDelete = (event: Event) => {
        setSelectedEvent(event);
        setIsDeleteOpen(true);
    };
    
    const handleView = (event: Event) => {
        setSelectedEvent(event);
        setIsViewOpen(true);
    };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline">Manage Events</h1>
          <p className="text-muted-foreground">Create, edit, and publish campus events.</p>
        </div>
        <AddEditEventDialog mode="add" onEventUpdated={fetchEvents} />
      </div>

       {isLoading ? (
            <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
        ) : events.length > 0 ? (
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <EventCard 
                        key={event.id}
                        event={event}
                        onEdit={() => handleEdit(event)}
                        onDelete={() => handleDelete(event)}
                        onView={() => handleView(event)}
                    />
                ))}
            </div>
        ) : (
            <Card className="text-center p-8">
                <CardTitle>No Events Found</CardTitle>
                <CardDescription>Create an event to get started.</CardDescription>
            </Card>
        )}

      {selectedEvent && (
        <>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                 <AddEditEventDialog mode="edit" event={selectedEvent} onEventUpdated={() => { fetchEvents(); setIsEditOpen(false); }} />
            </Dialog>

            <DeleteEventDialog 
                event={selectedEvent}
                onEventDeleted={() => { fetchEvents(); setIsDeleteOpen(false); }}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
            />

             <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl p-0">
                   <EventCard event={selectedEvent} onEdit={()=>{}} onDelete={()=>{}} onView={()=>{}} />
                </DialogContent>
            </Dialog>
        </>
      )}

    </div>
  );
}
