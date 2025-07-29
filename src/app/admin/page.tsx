
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const degreesData = [
    { name: 'B.Tech', duration: '4 Years', streams: 3 },
    { name: 'MCA', duration: '2 Years', streams: 1 },
    { name: 'BCA', duration: '3 Years', streams: 1 },
    { name: 'MBA', duration: '2 Years', streams: 3 },
    { name: 'Nursing', duration: '3 Years', streams: 1 },
    { name: 'BBA', duration: '3 Years', streams: 1 },
];

const teachersData = [
    { name: 'Dr. Alan Smith', email: 'alan.s@example.com', degree: 'B.Tech', stream: 'CSE', year: '1st' },
    { name: 'Prof. Mary Jane', email: 'mary.j@example.com', degree: 'MBA', stream: 'Finance', year: '2nd' },
    { name: 'Mr. Ankit Sharma', email: 'ankit.s@example.com', degree: 'B.Tech', stream: 'AIML', year: '1st' },
]

export default function AdminPage() {
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
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Degree
              </Button>
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
                  {degreesData.map((degree) => (
                    <TableRow key={degree.name}>
                      <TableCell className="font-medium">{degree.name}</TableCell>
                      <TableCell>{degree.duration}</TableCell>
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
                  ))}
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
