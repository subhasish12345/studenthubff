'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Ticket, Users, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const events = [
  {
    title: 'Innovate 2024 Hackathon',
    type: 'Competition',
    date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    location: 'Main Auditorium',
    image: 'https://placehold.co/600x400',
    aiHint: 'technology conference',
  },
  {
    title: 'Guest Lecture: AI in Healthcare',
    type: 'Workshop',
    date: new Date(new Date().getTime() + 12 * 24 * 60 * 60 * 1000),
    location: 'Seminar Hall 2',
    image: 'https://placehold.co/600x400',
    aiHint: 'lecture hall',
  },
  {
    title: 'Annual Sports Day',
    type: 'Social',
    date: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000),
    location: 'University Sports Complex',
    image: 'https://placehold.co/600x400',
    aiHint: 'running track',
  },
];

const Countdown = ({ toDate }: { toDate: Date }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(toDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
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
    if (!(timeLeft as any)[interval] && interval !== 'days') {
       if (Object.keys(timeLeft).indexOf(interval) > 0 && !(timeLeft as any)[Object.keys(timeLeft)[Object.keys(timeLeft).indexOf(interval)-1]]) return;
    }
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


export default function EventsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline">Events</h1>
          <p className="text-muted-foreground">Discover what's happening on campus.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event, index) => (
          <Card key={index} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
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
                <span>{event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div>
                <Countdown toDate={event.date} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Ticket className="mr-2 h-4 w-4" />
                RSVP Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
