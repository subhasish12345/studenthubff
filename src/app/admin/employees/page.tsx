
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Loader2, Edit, Trash2, Settings, ListPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Employee, addEmployee, getEmployees, updateEmployee, deleteEmployee, EmployeeStatus, SalaryType } from '@/services/employees';
import { Department, getDepartments, addDepartment } from '@/services/departments';
import { Designation, getDesignations, addDesignation } from '@/services/designations';

// A simplified dialog for adding a department or designation
function AddMetaDialog({ type, onAdded, departments }: { type: 'Department' | 'Designation', onAdded: () => void, departments?: Department[] }) {
    const [name, setName] = useState('');
    const [departmentType, setDepartmentType] = useState('');
    const [parentDepartment, setParentDepartment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || (type === 'Department' && !departmentType) || (type === 'Designation' && !parentDepartment)) {
            toast({ variant: 'destructive', title: 'Error', description: 'All fields are required.' });
            return;
        }
        setIsLoading(true);
        try {
            if (type === 'Department') {
                await addDepartment({ name, type: departmentType as Department['type'] });
            } else {
                await addDesignation({ name, departmentId: parentDepartment });
            }
            toast({ title: 'Success', description: `${type} added successfully.` });
            onAdded();
            setOpen(false);
            setName('');
            setDepartmentType('');
            setParentDepartment('');
        } catch (error) {
            const msg = error instanceof Error ? error.message : `Unknown error.`;
            toast({ variant: 'destructive', title: 'Error', description: msg });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Use DropdownMenuItem as the trigger for the dialog
    const Trigger = type === 'Department'
        ? <DropdownMenuItem onSelect={e => e.preventDefault()}><ListPlus className="mr-2 h-4 w-4"/> New {type}</DropdownMenuItem>
        : <DropdownMenuItem onSelect={e => e.preventDefault()}><ListPlus className="mr-2 h-4 w-4"/> New {type}</DropdownMenuItem>;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{Trigger}</DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader><DialogTitle>Add New {type}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{type} Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={`e.g., ${type === 'Department' ? 'Computer Science' : 'Professor'}`} />
                        </div>
                        {type === 'Department' && (
                             <div className="space-y-2">
                                <Label htmlFor="type">Department Type</Label>
                                <Select onValueChange={setDepartmentType} value={departmentType}>
                                    <SelectTrigger><SelectValue placeholder="Select type..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Academic">Academic</SelectItem>
                                        <SelectItem value="Non-Academic">Non-Academic</SelectItem>
                                        <SelectItem value="Support">Support</SelectItem>
                                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                        <SelectItem value="Creative">Creative</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {type === 'Designation' && departments && (
                             <div className="space-y-2">
                                <Label htmlFor="parent">Belongs to Department</Label>
                                <Select onValueChange={setParentDepartment} value={parentDepartment}>
                                    <SelectTrigger><SelectValue placeholder="Select department..."/></SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Add {type}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


function ManageEmployeeDialog({ mode, employee, onEmployeeUpdated, departments, designations }: { 
    mode: 'add' | 'edit', 
    employee?: Employee, 
    onEmployeeUpdated: () => void,
    departments: Department[],
    designations: Designation[],
}) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        fullName: employee?.fullName || '',
        employeeId: employee?.employeeId || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        departmentId: employee?.departmentId || '',
        designationId: employee?.designationId || '',
        dateOfJoining: employee ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '',
        status: employee?.status || 'Active',
        salaryType: employee?.salaryType || 'Fixed',
        salaryAmount: employee?.salaryAmount || 0,
    });
    
    useEffect(() => {
        if(open) {
             setFormData({
                fullName: employee?.fullName || '',
                employeeId: employee?.employeeId || '',
                email: employee?.email || '',
                phone: employee?.phone || '',
                departmentId: employee?.departmentId || '',
                designationId: employee?.designationId || '',
                dateOfJoining: employee ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '',
                status: employee?.status || 'Active',
                salaryType: employee?.salaryType || 'Fixed',
                salaryAmount: employee?.salaryAmount || 0,
            });
        }
    }, [open, employee]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const employeeData = {
                ...formData,
                dateOfJoining: new Date(formData.dateOfJoining).getTime(),
                salaryAmount: Number(formData.salaryAmount)
            };

            if (mode === 'add') {
                await addEmployee(employeeData);
                toast({ title: 'Success', description: 'Employee record created.' });
            } else if (employee) {
                await updateEmployee(employee.id, employeeData);
                toast({ title: 'Success', description: 'Employee record updated.' });
            }
            onEmployeeUpdated();
            setOpen(false);
        } catch (error) {
            const msg = error instanceof Error ? error.message : `An unknown error occurred.`;
            toast({ variant: 'destructive', title: 'Error', description: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDesignations = useMemo(() => {
        if (!formData.departmentId) return [];
        return designations.filter(d => d.departmentId === formData.departmentId);
    }, [formData.departmentId, designations]);

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'add' ? (
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Employee</Button>
                ) : (
                    <DropdownMenuItem onSelect={e => e.preventDefault()}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader><DialogTitle>{mode === 'add' ? 'Add New Employee' : `Edit ${employee?.fullName}`}</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        {/* Personal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={formData.fullName} onChange={handleInputChange}/></div>
                             <div className="space-y-2"><Label htmlFor="employeeId">Employee ID</Label><Input id="employeeId" value={formData.employeeId} onChange={handleInputChange}/></div>
                             <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange}/></div>
                             <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.phone} onChange={handleInputChange}/></div>
                             <div className="space-y-2"><Label htmlFor="dateOfJoining">Joining Date</Label><Input id="dateOfJoining" type="date" value={formData.dateOfJoining} onChange={handleInputChange}/></div>
                              <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={v => handleSelectChange('status', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="On-Leave">On-Leave</SelectItem><SelectItem value="Resigned">Resigned</SelectItem><SelectItem value="Terminated">Terminated</SelectItem></SelectContent></Select></div>
                        </div>
                        {/* Department & Role */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2"><Label htmlFor="departmentId">Department</Label><Select value={formData.departmentId} onValueChange={v => handleSelectChange('departmentId', v)}><SelectTrigger><SelectValue placeholder="Select department..."/></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                             <div className="space-y-2"><Label htmlFor="designationId">Designation</Label><Select value={formData.designationId} onValueChange={v => handleSelectChange('designationId', v)} disabled={!formData.departmentId}><SelectTrigger><SelectValue placeholder="Select designation..."/></SelectTrigger><SelectContent>{filteredDesignations.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                         </div>
                        {/* Salary Details */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2"><Label htmlFor="salaryType">Salary Type</Label><Select value={formData.salaryType} onValueChange={v => handleSelectChange('salaryType', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Hourly">Hourly</SelectItem><SelectItem value="Incentive-Based">Incentive-Based</SelectItem></SelectContent></Select></div>
                             <div className="space-y-2"><Label htmlFor="salaryAmount">Salary Amount (INR)</Label><Input id="salaryAmount" type="number" value={formData.salaryAmount} onChange={handleInputChange}/></div>
                         </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function EmployeeHubPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [empData, deptData, desigData] = await Promise.all([
                getEmployees(),
                getDepartments(),
                getDesignations(),
            ]);
            setEmployees(empData);
            setDepartments(deptData);
            setDesignations(desigData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch initial data.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';
    const getDesignationName = (id: string) => designations.find(d => d.id === id)?.name || 'N/A';

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h1 className="text-4xl font-bold font-headline">Employee Hub</h1>
                <p className="text-muted-foreground">Manage all staff, departments, and designations.</p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Employees</CardTitle>
                        <CardDescription>A complete list of all staff members in the institution.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline"><Settings className="mr-2 h-4 w-4"/>Manage</Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Manage Meta</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <AddMetaDialog type="Department" onAdded={fetchData} />
                                <AddMetaDialog type="Designation" onAdded={fetchData} departments={departments} />
                            </DropdownMenuContent>
                         </DropdownMenu>
                         <ManageEmployeeDialog mode="add" onEmployeeUpdated={fetchData} departments={departments} designations={designations} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        <div className="flex justify-center items-center p-8">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading employees...
                                        </div>
                                    </TableCell>
                                </TableRow>
                           ) : employees.length > 0 ? (
                                employees.map(emp => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-medium">{emp.fullName}</TableCell>
                                        <TableCell>{emp.employeeId}</TableCell>
                                        <TableCell>{getDepartmentName(emp.departmentId)}</TableCell>
                                        <TableCell>{getDesignationName(emp.designationId)}</TableCell>
                                        <TableCell><Badge variant={emp.status === 'Active' ? 'default' : 'secondary'}>{emp.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <ManageEmployeeDialog mode="edit" employee={emp} onEmployeeUpdated={fetchData} departments={departments} designations={designations}/>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                               <TableRow>
                                    <TableCell colSpan={6} className="text-center p-8">
                                        No employees found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
