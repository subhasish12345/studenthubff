import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { BarChart, BookOpen, CalendarDays, ClipboardList, Folder, LayoutDashboard, Timer, Users, FileText, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline">Welcome Back, Alex!</h1>
          <p className="text-muted-foreground">Here's your snapshot for today.</p>
        </div>
        <div className="flex items-center gap-4">
           <Avatar>
            <AvatarImage src="https://placehold.co/100x100" alt="User avatar" data-ai-hint="user avatar" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time Today</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h 45m</div>
            <p className="text-xs text-muted-foreground">+20% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">1 due today</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Hackathon this weekend</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Notices</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Check the notice board</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump right back into your work.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/focus" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Timer size={24} />
                <span>Start Focus</span>
              </Button>
            </Link>
            <Link href="/assignments" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <ClipboardList size={24} />
                <span>Assignments</span>
              </Button>
            </Link>
            <Link href="/events" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <CalendarDays size={24} />
                <span>Events</span>
              </Button>
            </Link>
            <Link href="/resources" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Folder size={24} />
                <span>Resources</span>
              </Button>
            </Link>
             <Link href="/notices" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Bell size={24} />
                <span>Notice Board</span>
              </Button>
            </Link>
            <Link href="/resume-builder" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <FileText size={24} />
                <span>Resume Builder</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              selected={[new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)]}
              className="p-0"
              disabled
            />
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Notices</CardTitle>
             <CardDescription>Stay updated with the latest announcements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full"><Bell className="text-primary"/></div>
                  <div>
                      <p className="font-semibold">Mid-term Exam Schedule</p>
                      <p className="text-sm text-muted-foreground">The schedule for the upcoming mid-term exams has been posted. Check the notice board for details.</p>
                  </div>
              </div>
              <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full"><Users className="text-primary"/></div>
                  <div>
                      <p className="font-semibold">Annual Sports Day Registration</p>
                      <p className="text-sm text-muted-foreground">Registrations for the annual sports day are now open. Last day to register is Oct 25th.</p>
                  </div>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Circles</CardTitle>
            <CardDescription>Your study and project groups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40" data-ai-hint="logo" />
                  <AvatarFallback>DS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Data Science Club</p>
                  <p className="text-sm text-muted-foreground">5 active members</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40" data-ai-hint="logo" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">AI Innovators</p>
                  <p className="text-sm text-muted-foreground">3 active members</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
