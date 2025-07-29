'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addDegree, getDegrees, Degree } from '@/services/degrees';


const teachersData = [
    { name: 'Dr. Alan Smith', email: 'alan.s@example.com', degree: 'B.Tech', stream: 'CSE', year: '1st' },
    { name: 'Prof. Mary Jane', email: 'mary.j@example.com', degree: 'MBA', stream: 'Finance', year: '2nd' },
    { name: 'Mr. Ankit Sharma', email: 'ankit.s@example.com', degree: 'B.Tech', stream: 'AIML', year: '1st' },
];

function AddDegreeDialog({ onDegreeAdded }: { onDegreeAdded: () => void }) {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !duration) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
            return;
        }
        setIsLoading(true);
        try {
            await addDegree({ name, duration: parseInt(duration, 10), streams: 0 });
            toast({ title: 'Success', description: 'Degree added successfully.' });
            onDegreeAdded();
            setOpen(false); // Close the dialog on success
            setName('');
            setDuration('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add degree.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Degree
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Degree</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. B.Tech" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">Duration (Years)</Label>
                            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 4" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                         </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Degree
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminPage() {
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [isLoadingDegrees, setIsLoadingDegrees] = useState(true);

    const fetchDegrees = async () => {
        setIsLoadingDegrees(true);
        const degreesData = await getDegrees();
        setDegrees(degreesData);
        setIsLoadingDegrees(false);
    };

    useEffect(() => {
        fetchDegrees();
    }, []);


    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-bold font-headline">Admin Panel</h1>
                <p className="text-muted-foreground">Manage your institution's structure, users, and content.</p>
            </div>

            <Tabs defaultValue="degrees">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="degrees">Degrees & Batches</TabsTrigger>
                    <TabsTrigger value="teachers">Teachers</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                </TabsList>

                <TabsContent value="degrees" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Manage Degrees</CardTitle>
                                <CardDescription>Add, edit, or remove academic degrees and their streams/batches.</CardDescription>
                            </div>
                            <AddDegreeDialog onDegreeAdded={fetchDegrees} />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Degree Name</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Streams / Majors</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingDegrees ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                <div className="flex justify-center items-center">
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading degrees...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : degrees.length > 0 ? (
                                        degrees.map((degree) => (
                                            <TableRow key={degree.id}>
                                                <TableCell className="font-medium">{degree.name}</TableCell>
                                                <TableCell>{degree.duration} Years</TableCell>
                                                <TableCell>{degree.streams}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem>Manage Streams</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No degrees found. Add one to get started.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="teachers" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Manage Teachers</CardTitle>
                                <CardDescription>Onboard new teachers and assign them to specific batches.</CardDescription>
                            </div>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Teacher
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Assigned Batch</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachersData.map((teacher) => (
                                        <TableRow key={teacher.email}>
                                            <TableCell className="font-medium">{teacher.name}</TableCell>
                                            <TableCell><Badge variant="outline">{teacher.degree} {teacher.year} Yr - {teacher.stream}</Badge></TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="students" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Manage Students</CardTitle>
                                <CardDescription>View all students, manage their batches, or invite new ones.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">Invite Students</Button>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Student
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>Student management table will go here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
