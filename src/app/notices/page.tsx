import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, User } from 'lucide-react';

const notices = [
  {
    title: 'Mid-term Exam Schedule Published',
    category: 'Academics',
    date: 'October 15, 2024',
    author: 'Admin',
    content: 'The schedule for the upcoming mid-term examinations has been published. Please check the "Exams" section on the portal for detailed timings and subjects. All students are advised to prepare accordingly.'
  },
  {
    title: 'Annual Tech Fest "Innovate 2024"',
    category: 'Events',
    date: 'October 14, 2024',
    author: 'Student Council',
    content: 'Get ready for the biggest tech event of the year! "Innovate 2024" is scheduled for November 5-7. Registrations for workshops and competitions are now open. Visit the event page for more details.'
  },
  {
    title: 'Library Closure for Maintenance',
    category: 'Campus',
    date: 'October 12, 2024',
    author: 'Admin',
    content: 'The central library will be closed for annual maintenance from October 20th to October 22nd. Please return or renew any issued books before the closure dates. The digital library will remain accessible.'
  },
  {
    title: 'Scholarship Application Deadline Extended',
    category: 'Academics',
    date: 'October 10, 2024',
    author: 'Admin',
    content: 'The deadline for applying for the Merit-Based Scholarship for the year 2024-25 has been extended to November 15th. Eligible students who have not yet applied are encouraged to do so.'
  },
];

export default function NoticeBoardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold font-headline">Notice Board</h1>
        <p className="text-muted-foreground">Stay informed with the latest updates and announcements.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notices.map((notice, index) => (
          <Card key={index} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-primary"/>
                <Badge variant="outline">{notice.category}</Badge>
              </div>
              <CardTitle className="font-headline">{notice.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{notice.content}</p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-between">
                <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>{notice.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{notice.date}</span>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
