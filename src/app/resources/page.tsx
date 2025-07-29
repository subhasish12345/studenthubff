import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, FileText, Download } from 'lucide-react';

const resources = [
  { name: 'Calculus Cheat Sheet', type: 'PDF', size: '1.2MB', tags: ['Math', 'Formulas'] },
  { name: 'History Lecture Notes - Week 5', type: 'DOCX', size: '450KB', tags: ['History', 'Lecture'] },
  { name: 'Photosynthesis Diagram', type: 'PNG', size: '2.5MB', tags: ['Science', 'Biology', 'Diagram'] },
  { name: 'Literary Devices Guide', type: 'PDF', size: '800KB', tags: ['English', 'Writing'] },
  { name: 'Final Project Proposal', type: 'DOCX', size: '250KB', tags: ['Project', 'Proposal'] },
  { name: 'Chemistry Lab Manual', type: 'PDF', size: '5.1MB', tags: ['Science', 'Chemistry'] },
];

export default function ResourcesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline">Resource Manager</h1>
          <p className="text-muted-foreground">Your personal library of study materials.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-10 w-full" />
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resources.map((resource, index) => (
          <Card key={index} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
               <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{resource.name}</CardTitle>
                <CardDescription>{resource.type} &bull; {resource.size}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
