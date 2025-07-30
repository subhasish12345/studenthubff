

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Loader2, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getDegrees, Degree, updateDegree, deleteDegree } from '@/services/degrees';
import { addStream, getStreams, Stream } from '@/services/streams';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createDegreeStructure } from '@/services/setup-collections';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Batch, addBatch, getBatchesForStream, deleteBatch } from '@/services/batches';
import { Section, addSection, getSections } from '@/services/sections';
import { Year, getYearsForBatch } from '@/services/years';
import { Semester, getSemestersForYear } from '@/services/semesters';


const teachersData = [
    { name: 'Dr. Alan Smith', email: 'alan.s@example.com', degree: 'B.Tech', stream: 'CSE', year: '1st' },
    { name: 'Prof. Mary Jane', email: 'mary.j@example.com', degree: 'MBA', stream: 'Finance', year: '2nd' },
    { name: 'Mr. Ankit Sharma', email: 'ankit.s@example.com', degree: 'B.Tech', stream: 'AIML', year: '1st' },
];

function AddDegreeDialog({ onDegreeAdded }: { onDegreeAdded: () => void }) {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState(0);
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
            await createDegreeStructure(name, duration);
            toast({ title: 'Success', description: `Degree structure for ${name} created successfully.` });
            onDegreeAdded();
            setOpen(false);
            setName('');
            setDuration(0);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast({ variant: 'destructive', title: 'Error', description: `Failed to create degree structure: ${errorMessage}` });
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
                            <Select onValueChange={setName} value={name}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a degree" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                                    <SelectItem value="MCA">MCA</SelectItem>
                                    <SelectItem value="MBA">MBA</SelectItem>
                                    <SelectItem value="BCA">BCA</SelectItem>
                                    <SelectItem value="BBA">BBA</SelectItem>
                                    <SelectItem value="Nursing">Nursing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">Duration</Label>
                             <Select onValueChange={(val) => setDuration(parseInt(val,10))} value={duration ? duration.toString() : ''}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select duration (years)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2 Years</SelectItem>
                                    <SelectItem value="3">3 Years</SelectItem>
                                    <SelectItem value="4">4 Years</SelectItem>
                                </SelectContent>
                            </Select>
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

function EditDegreeDialog({ degree, onDegreeUpdated }: { degree: Degree, onDegreeUpdated: () => void }) {
    const [name, setName] = useState(degree.name);
    const [duration, setDuration] = useState(degree.duration);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateDegree(degree.id, { name, duration });
            toast({ title: 'Success', description: 'Degree updated successfully.' });
            onDegreeUpdated();
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update degree.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Degree
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Degree</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" readOnly />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">Duration</Label>
                             <Select onValueChange={(val) => setDuration(parseInt(val,10))} value={duration ? duration.toString() : ''}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select duration (years)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2 Years</SelectItem>
                                    <SelectItem value="3">3 Years</SelectItem>
                                    <SelectItem value="4">4 Years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                         </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Degree
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteDegreeDialog({ degreeId, onDegreeDeleted }: { degreeId: string; onDegreeDeleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteDegree(degreeId);
            toast({ title: "Success", description: "Degree and all its data have been deleted." });
            onDegreeDeleted();
        } catch (error) {
            console.error("Error deleting degree: ", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: `Failed to delete degree: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Degree
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the degree
                        and all associated streams, years, batches, students, teachers, and other data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, delete it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function DeleteBatchDialog({ degreeId, streamId, batchId, onBatchDeleted }: { degreeId: string, streamId: string, batchId: string, onBatchDeleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteBatch(degreeId, streamId, batchId);
            toast({ title: "Success", description: "Batch deleted successfully." });
            onBatchDeleted();
        } catch (error) {
            console.error("Error deleting batch: ", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: `Failed to delete batch: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Batch
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the batch and all its data (students, teachers, etc.). This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


function ManageSectionsDialog({ degree, stream, batch }: { degree: Degree; stream: Stream; batch: Batch }) {
    const [open, setOpen] = useState(false);
    
    const [years, setYears] = useState<Year[]>([]);
    const [isLoadingYears, setIsLoadingYears] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

    const [sections, setSections] = useState<Section[]>([]);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    
    const [newSectionName, setNewSectionName] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!open) return;
        const fetchYears = async () => {
            setIsLoadingYears(true);
            try {
                const yearData = await getYearsForBatch(degree.id, stream.id, batch.id);
                setYears(yearData);
                if (yearData.length > 0) setSelectedYear(yearData[0].id);
                else setSelectedYear(null);
            } catch (error) { toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch academic years.' }); }
            finally { setIsLoadingYears(false); }
        };
        fetchYears();
    }, [open, degree.id, stream.id, batch.id]);

    useEffect(() => {
        if (!selectedYear) {
            setSemesters([]);
            setSelectedSemester(null);
            return;
        };
        const fetchSemesters = async () => {
            setIsLoadingSemesters(true);
            try {
                const semesterData = await getSemestersForYear(degree.id, stream.id, batch.id, selectedYear);
                setSemesters(semesterData);
                 if (semesterData.length > 0) setSelectedSemester(semesterData[0].id);
                 else setSelectedSemester(null);
            } catch (error) { toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch semesters.' }); }
            finally { setIsLoadingSemesters(false); }
        };
        fetchSemesters();
    }, [selectedYear]);

    const fetchSections = async (yearId: string, semesterId: string) => {
        setIsLoadingSections(true);
        try {
            const sectionsData = await getSections(degree.id, stream.id, batch.id, yearId, semesterId);
            setSections(sectionsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch sections.' });
        } finally {
            setIsLoadingSections(false);
        }
    };
    
    useEffect(() => {
        if (selectedYear && selectedSemester) {
            fetchSections(selectedYear, selectedSemester);
        } else {
            setSections([]);
        }
    }, [selectedYear, selectedSemester]);

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectionName || !selectedYear || !selectedSemester) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a section name.' });
            return;
        }
        setIsAddingSection(true);
        try {
            await addSection(degree.id, stream.id, batch.id, selectedYear, selectedSemester, { name: newSectionName });
            toast({ title: 'Success', description: `Section "${newSectionName}" added.` });
            setNewSectionName('');
            fetchSections(selectedYear, selectedSemester); // Refresh the list
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add section.";
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsAddingSection(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Manage Sections</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Manage Sections for {batch.name}</DialogTitle>
                    <CardDescription>Add and view sections for each semester of this batch.</CardDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="year-select">Academic Year</Label>
                            {isLoadingYears ? (
                                <div className="flex items-center space-x-2 mt-1"><Loader2 className="h-4 w-4 animate-spin"/><span>Loading...</span></div>
                            ) : (
                                <Select onValueChange={setSelectedYear} value={selectedYear || ''}>
                                    <SelectTrigger id="year-select" className="mt-1"><SelectValue placeholder="Select Year" /></SelectTrigger>
                                    <SelectContent>{years.map(year => <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="semester-select">Semester</Label>
                             {isLoadingSemesters ? (
                                <div className="flex items-center space-x-2 mt-1"><Loader2 className="h-4 w-4 animate-spin"/><span>Loading...</span></div>
                            ) : (
                                <Select onValueChange={setSelectedSemester} value={selectedSemester || ''} disabled={!selectedYear}>
                                    <SelectTrigger id="semester-select" className="mt-1"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                                    <SelectContent>{semesters.map(sem => <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                    

                    <div className="space-y-4">
                        <h3 className="font-semibold text-md">Existing Sections</h3>
                        <div className="border rounded-md min-h-[100px] max-h-48 overflow-y-auto">
                            {isLoadingSections ? (
                                <div className="p-4 text-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...</div>
                            ) : sections.length > 0 ? (
                                <Table>
                                    <TableBody>
                                        {sections.map(section => (
                                            <TableRow key={section.id}>
                                                <TableCell>{section.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Manage Section</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="p-4 text-center text-muted-foreground">No sections found for this selection.</p>
                            )}
                        </div>
                    </div>
                    
                    <form onSubmit={handleAddSection} className="flex gap-2">
                        <Input 
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="New section name (e.g. Section C)"
                            disabled={isAddingSection || !selectedSemester}
                        />
                        <Button type="submit" disabled={isAddingSection || !selectedSemester}>
                           {isAddingSection ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                           <span className="sr-only sm:not-sr-only sm:ml-2">Add Section</span>
                        </Button>
                    </form>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ManageBatchesDialog({ degree, stream }: { degree: Degree; stream: Stream }) {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [batchName, setBatchName] = useState('');
    const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
    const [endYear, setEndYear] = useState<number>(new Date().getFullYear() + degree.duration);

    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const fetchBatches = async () => {
        setIsLoading(true);
        try {
            const batchesData = await getBatchesForStream(degree.id, stream.id);
            setBatches(batchesData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch batches.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (open) {
           fetchBatches();
        }
    }, [open, degree.id, stream.id]);

    useEffect(() => {
        setEndYear(startYear + degree.duration);
        setBatchName(`${startYear}-${startYear + degree.duration} Batch`);
    }, [startYear, degree.duration]);

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchName || !startYear || !endYear) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill all batch fields.' });
            return;
        }
        setIsCreating(true);
        try {
            const newBatch: Omit<Batch, 'id' | 'currentYear'> = {
                name: batchName,
                startYear,
                endYear,
                promotedYears: 0,
                startMonth: 8, // August
            };
            await addBatch(degree.id, stream.id, degree.duration, newBatch);
            toast({ title: 'Success', description: 'New batch created.' });
            setBatchName('');
            setStartYear(new Date().getFullYear());
            fetchBatches(); // Refresh list
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to create batch.";
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsCreating(false);
        }
    };

    const calculateCurrentYear = (batch: Batch) => {
        const currentMonth = new Date().getMonth() + 1;
        const currentFullYear = new Date().getFullYear();
        let academicYear = currentFullYear - batch.startYear;
        if (currentMonth < batch.startMonth) {
            academicYear--;
        }
        academicYear++; 
        academicYear += batch.promotedYears;

        if (academicYear > (batch.endYear - batch.startYear)) return 'Graduated';
        if (academicYear <= 0) return 'Not Started';

        switch (academicYear) {
            case 1: return '1st Year';
            case 2: return '2nd Year';
            case 3: return '3rd Year';
            default: return `${academicYear}th Year`;
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Manage Batches</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Manage Batches for {degree.name} - {stream.name}</DialogTitle>
                    <CardDescription>Create new batches and manage existing ones for this stream.</CardDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* Add Batch Form */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Create New Batch</h3>
                        <form onSubmit={handleAddBatch} className="space-y-4">
                             <div>
                                <Label htmlFor="batch-name">Batch Name</Label>
                                <Input id="batch-name" value={batchName} onChange={e => setBatchName(e.target.value)} placeholder="e.g., 2024-2028 Batch" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start-year">Start Year</Label>
                                    <Input id="start-year" type="number" value={startYear} onChange={e => setStartYear(parseInt(e.target.value, 10))} />
                                </div>
                                <div>
                                    <Label htmlFor="end-year">End Year</Label>
                                    <Input id="end-year" type="number" value={endYear} readOnly />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Batch
                            </Button>
                        </form>
                    </div>

                    {/* Existing Batches List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Existing Batches</h3>
                         <div className="border rounded-md max-h-72 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading Batches...
                                </div>
                            ) : batches.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Batch</TableHead>
                                            <TableHead>Current Year</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batches.map(batch => (
                                            <TableRow key={batch.id}>
                                                <TableCell className="font-medium">{batch.name}</TableCell>
                                                <TableCell><Badge variant="secondary">{calculateCurrentYear(batch)}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <ManageSectionsDialog degree={degree} stream={stream} batch={batch} />
                                                            <DropdownMenuItem>Edit Batch</DropdownMenuItem>
                                                            <DropdownMenuItem>Promote Batch</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DeleteBatchDialog degreeId={degree.id} streamId={stream.id} batchId={batch.id} onBatchDeleted={fetchBatches} />
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="p-4 text-center text-muted-foreground">No batches found. Create one to start.</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ManageStreamsDialog({ degree, onStreamAdded }: { degree: Degree, onStreamAdded: () => void }) {
    const [streamName, setStreamName] = useState('');
    const [streams, setStreams] = useState<Stream[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingStreams, setIsFetchingStreams] = useState(true);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const fetchStreams = async () => {
        if (!degree.id) return;
        setIsFetchingStreams(true);
        try {
            const streamsData = await getStreams(degree.id);
            setStreams(streamsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch streams.'})
        } finally {
            setIsFetchingStreams(false);
        }
    }

    useEffect(() => {
        if (open) {
            fetchStreams();
        }
    }, [open, degree.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!streamName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Stream name cannot be empty.' });
            return;
        }
        setIsLoading(true);
        try {
            await addStream(degree.id, { name: streamName });
            toast({ title: 'Success', description: `Stream "${streamName}" added to ${degree.name}.` });
            setStreamName('');
            fetchStreams(); // Refresh stream list
            onStreamAdded(); // Refresh degree list in parent
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add stream.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Manage Streams</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Manage Streams for {degree.name}</DialogTitle>
                    <CardDescription>Add or view streams for this degree.</CardDescription>
                </DialogHeader>
                <div className="py-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input 
                            value={streamName} 
                            onChange={(e) => setStreamName(e.target.value)} 
                            placeholder="e.g. Computer Science" 
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                            <span className="sr-only sm:not-sr-only sm:ml-2">Add</span>
                        </Button>
                    </form>
                </div>
                <div>
                    <h3 className="text-sm font-medium mb-2">Existing Streams</h3>
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                        {isFetchingStreams ? (
                            <div className="p-4 text-center text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                            </div>
                        ) : streams.length > 0 ? (
                           <Table>
                               <TableBody>
                                    {streams.map(stream => (
                                        <TableRow key={stream.id}>
                                            <TableCell className="font-medium">{stream.name}</TableCell>
                                            <TableCell className="text-right">
                                                <ManageBatchesDialog degree={degree} stream={stream} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                               </TableBody>
                           </Table>
                        ) : (
                            <p className="p-4 text-center text-muted-foreground">No streams found.</p>
                        )}
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function AdminPage() {
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [isLoadingDegrees, setIsLoadingDegrees] = useState(true);
    const { toast } = useToast();

    const fetchDegrees = async () => {
        setIsLoadingDegrees(true);
        try {
            const degreesData = await getDegrees();
            setDegrees(degreesData);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch degrees.' });
        } finally {
            setIsLoadingDegrees(false);
        }
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
                                                <TableCell>{degree.streamCount}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <EditDegreeDialog degree={degree} onDegreeUpdated={fetchDegrees} />
                                                            <ManageStreamsDialog degree={degree} onStreamAdded={fetchDegrees} />
                                                            <DeleteDegreeDialog degreeId={degree.id} onDegreeDeleted={fetchDegrees} />
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

    
