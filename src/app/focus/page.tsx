'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Music, Pause, Play, Power, RotateCcw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const FOCUS_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

const leaderboard = [
  { rank: 1, name: 'Sarah J.', time: '12h 30m', avatar: 'https://placehold.co/40x40' },
  { rank: 2, name: 'Mike L.', time: '11h 15m', avatar: 'https://placehold.co/40x40' },
  { rank: 3, name: 'You', time: '10h 45m', avatar: 'https://placehold.co/40x40' },
  { rank: 4, name: 'Emily K.', time: '9h 5m', avatar: 'https://placehold.co/40x40' },
];

export default function FocusPage() {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [time, setTime] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);

  const totalTime = mode === 'focus' ? FOCUS_TIME : mode === 'shortBreak' ? SHORT_BREAK_TIME : LONG_BREAK_TIME;

  const changeMode = useCallback((newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'focus':
        setTime(FOCUS_TIME);
        break;
      case 'shortBreak':
        setTime(SHORT_BREAK_TIME);
        break;
      case 'longBreak':
        setTime(LONG_BREAK_TIME);
        break;
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      // Automatically switch to the next mode
      if (mode === 'focus') {
        changeMode('shortBreak');
      } else {
        changeMode('focus');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, changeMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold font-headline">Focus Session</h1>
        <p className="text-muted-foreground">Minimize distractions and get things done.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="flex flex-col items-center justify-center p-8 text-center shadow-lg">
            <div className="flex gap-2 mb-8">
              <Button variant={mode === 'focus' ? 'default' : 'outline'} onClick={() => changeMode('focus')}>Pomodoro</Button>
              <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => changeMode('shortBreak')}>Short Break</Button>
              <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => changeMode('longBreak')}>Long Break</Button>
            </div>
            <div className="relative w-64 h-64 flex items-center justify-center">
                <Progress value={(time / totalTime) * 100} className="absolute w-full h-full rounded-full" />
                <div className="absolute text-6xl font-bold font-mono tracking-tighter text-foreground">
                    {formatTime(time)}
                </div>
            </div>
            <div className="flex gap-4 mt-8">
              <Button size="lg" className="px-8 py-6 rounded-full" onClick={() => setIsActive(!isActive)}>
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                <span className="sr-only">{isActive ? 'Pause' : 'Play'}</span>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 rounded-full" onClick={() => changeMode(mode)}>
                <RotateCcw className="w-8 h-8" />
                <span className="sr-only">Reset</span>
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top focused users this week.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((user) => (
                    <TableRow key={user.rank} className={user.name === 'You' ? 'bg-primary/10' : ''}>
                      <TableCell className="font-medium">{user.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} data-ai-hint="people portrait" />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{user.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Settings & Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Background Music</span>
                </div>
                <Switch checked={playMusic} onCheckedChange={setPlayMusic} />
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Sessions Today</span>
                 </div>
                 <span className="font-bold">4</span>
              </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Power className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Focus Streak</span>
                 </div>
                 <span className="font-bold">3 days</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
