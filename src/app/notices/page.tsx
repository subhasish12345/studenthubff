
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Loader2, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Notice, addNotice, getNotices, updateNotice, deleteNotice, NoticeCategory } from '@/services/notices';
import { Switch } from '@/components/ui/switch';
import { getDegrees } from '@/services/degrees';

function AddEditNoticeDialog({ mode, notice, onNoticeUpdated }: { mode: 'add' | 'edit', notice?: Notice, onNoticeUpdated: () => void }) {
    const [title, setTitle] = useState(notice?.title || '');
    const [message, setMessage] = useState(notice?.message || '');
    const [category, setCategory] = useState<NoticeCategory | ''>(notice?.category || '');
    const [postedBy, setPostedBy] = useState(notice?.posted_by || '');
    const [visibleToAll, setVisibleToAll] = useState(notice?.visible_to?.all ?? true);
    
    // For simplicity in this form, we'll use comma-separated strings
    const [degrees, setDegrees] = useState(notice?.visible_to?.degrees?.join(', ') || '');
    const [years, setYears] = useState(notice?.visible_to?.years?.join(', ') || '');
    const [streams, setStreams] = useState(notice?.visible_to?.streams?.join(', ') || '');

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    
    const dialogTitle = mode === 'add' ? 'Create New Notice' : 'Edit Notice';
    const buttonText = mode === 'add' ? 'Publish Notice' : 'Save Changes';

    useEffect(() => {
        if (open) {
            setTitle(notice?.title || '');
            setMessage(notice?.message || '');
            setCategory(notice?.category || '');
            setPostedBy(notice?.posted_by || '');
            setVisibleToAll(notice?.visible_to?.all ?? true);
            setDegrees(notice?.visible_to?.degrees?.join(', ') || '');
            setYears(notice?.visible_to?.years?.join(', ') || '');
            setStreams(notice?.visible_to?.streams?.join(', ') || '');
        }
    }, [open, notice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message || !category || !postedBy) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all required fields.' });
            return;
        }
        setIsLoading(true);

        const noticeData: Omit<Notice, 'id' | 'posted_on'> = {
            title,
            message,
            category,
            posted_by: postedBy,
            visible_to: {
                all: visibleToAll,
                degrees: visibleToAll ? [] : degrees.split(',').map(d => d.trim()).filter(Boolean),
                years: visibleToAll ? [] : years.split(',').map(y => y.trim()).filter(Boolean),
                streams: visibleToAll ? [] : streams.split(',').map(s => s.trim()).filter(Boolean),
            }
        };

        try {
            if (mode === 'add') {
                await addNotice(noticeData);
                toast({ title: 'Success', description: 'Notice has been published.' });
            } else if (notice) {
                await updateNotice(notice.id, noticeData);
                toast({ title: 'Success', description: 'Notice has been updated.' });
            }
            onNoticeUpdated();
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
                        Create Notice
                    </Button>
                ) : (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Notice
                    </DropdownMenuItem>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Mid-term Exam Schedule Published" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Detailed content of the notice..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={(v) => setCategory(v as NoticeCategory)} value={category}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Academic">Academic</SelectItem>
                                        <SelectItem value="Campus Life">Campus Life</SelectItem>
                                        <SelectItem value="Events">Events</SelectItem>
                                        <SelectItem value="Holiday">Holiday</SelectItem>
                                        <SelectItem value="Sports">Sports</SelectItem>
                                        <SelectItem value="Placement">Placement</SelectItem>
                                        <SelectItem value="Canteen">Canteen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="postedBy">Posted By</Label>
                                <Input id="postedBy" value={postedBy} onChange={e => setPostedBy(e.target.value)} placeholder="e.g., Principal, Warden" />
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Audience Targeting</CardTitle>
                                <CardDescription>Select who should see this notice.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch id="visible-to-all" checked={visibleToAll} onCheckedChange={setVisibleToAll} />
                                    <Label htmlFor="visible-to-all">Visible to All Users</Label>
                                </div>
                                {!visibleToAll && (
                                    <div className="grid gap-4 pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="degrees">Visible to Degrees (comma-separated)</Label>
                                            <Input id="degrees" value={degrees} onChange={e => setDegrees(e.target.value)} placeholder="e.g., B.Tech, MCA" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="years">Visible to Years (comma-separated)</Label>
                                            <Input id="years" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g., 1st Year, 2nd Year" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="streams">Visible to Streams (comma-separated)</Label>
                                            <Input id="streams" value={streams} onChange={e => setStreams(e.target.value)} placeholder="e.g., CSE, AIML" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
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

function DeleteNoticeDialog({ notice, onNoticeDeleted }: { notice: Notice, onNoticeDeleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteNotice(notice.id);
            toast({ title: "Success", description: "Notice removed successfully." });
            onNoticeDeleted();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: `Failed to remove notice: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Notice
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently remove the notice "{notice.title}". This action cannot be undone.
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

export default function NoticeBoardAdminPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchNotices = async () => {
        setIsLoading(true);
        try {
            const noticesData = await getNotices();
            setNotices(noticesData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch notices.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const formatAudience = (visible_to: Notice['visible_to']) => {
        if (visible_to.all) return <Badge>All Users</Badge>;
        
        const parts = [];
        if(visible_to.degrees?.length) parts.push(`Degrees: ${visible_to.degrees.join(', ')}`);
        if(visible_to.years?.length) parts.push(`Years: ${visible_to.years.join(', ')}`);
        if(visible_to.streams?.length) parts.push(`Streams: ${visible_to.streams.join(', ')}`);

        if(parts.length === 0) return <Badge variant="secondary">No specific audience</Badge>

        return (
            <div className="flex flex-wrap gap-1">
                {parts.map(part => <Badge key={part} variant="secondary">{part}</Badge>)}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h1 className="text-4xl font-bold font-headline">Manage Notices</h1>
                <p className="text-muted-foreground">Create, edit, and publish announcements for the institution.</p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Published Notices</CardTitle>
                        <CardDescription>A list of all notices that have been created.</CardDescription>
                    </div>
                    <AddEditNoticeDialog mode="add" onNoticeUpdated={fetchNotices} />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Posted By</TableHead>
                                <TableHead>Visible To</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading notices...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : notices.length > 0 ? (
                                notices.map((notice) => (
                                    <TableRow key={notice.id}>
                                        <TableCell className="font-medium">{notice.title}</TableCell>
                                        <TableCell><Badge variant="outline">{notice.category}</Badge></TableCell>
                                        <TableCell>{notice.posted_by}</TableCell>
                                        <TableCell>{formatAudience(notice.visible_to)}</TableCell>
                                        <TableCell>{new Date(notice.posted_on).toLocaleDateString()}</TableCell>
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
                                                    <AddEditNoticeDialog mode="edit" notice={notice} onNoticeUpdated={fetchNotices} />
                                                    <DeleteNoticeDialog notice={notice} onNoticeDeleted={fetchNotices} />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No notices found. Create one to get started.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
