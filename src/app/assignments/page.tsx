'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const assignmentsData = [
  { id: 1, subject: 'Math', task: 'Complete Chapter 5 exercises', due: '2024-10-25', status: 'In Progress' },
  { id: 2, subject: 'History', task: 'Essay on World War II', due: '2024-10-22', status: 'Completed' },
  { id: 3, subject: 'Science', task: 'Lab report on photosynthesis', due: '2024-11-01', status: 'Not Started' },
  { id: 4, subject: 'English', task: 'Read "To Kill a Mockingbird"', due: '2024-10-28', status: 'In Progress' },
  { id: 5, subject: 'Math', task: 'Prepare for quiz on Algebra', due: '2024-10-21', status: 'Completed' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Completed': return 'default';
    case 'In Progress': return 'secondary';
    case 'Not Started': return 'destructive';
    default: return 'outline';
  }
}

export default function AssignmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const assignmentDates = assignmentsData.map(a => new Date(a.due));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline">Assignment Tracker</h1>
          <p className="text-muted-foreground">Stay on top of your coursework.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task" className="text-right">Task</Label>
                <Input id="task" placeholder="e.g. Essay on The Great Gatsby" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">Subject</Label>
                 <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due-date" className="text-right">Due Date</Label>
                <Input id="due-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <Textarea id="notes" placeholder="Optional notes..." className="col-span-3" />
              </div>
               <Button type="submit" className="w-full mt-4">Save Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Assignments</CardTitle>
              <CardDescription>Filter and manage all your assignments here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentsData.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell><Badge variant="outline">{assignment.subject}</Badge></TableCell>
                      <TableCell className="font-medium">{assignment.task}</TableCell>
                      <TableCell>{assignment.due}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(assignment.status)}>{assignment.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Due Date Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="day"
                selected={assignmentDates}
                onDayClick={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
