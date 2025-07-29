import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeBuilderForm } from "./resume-form";

export default function ResumeBuilderPage() {
  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-4xl font-bold font-headline">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Fill in your details and let our AI craft a professional resume for you.
        </p>
      </div>
      <Card className="max-w-4xl mx-auto w-full shadow-lg">
        <CardHeader>
            <CardTitle>Create Your Resume</CardTitle>
            <CardDescription>Provide as much detail as possible for the best results.</CardDescription>
        </CardHeader>
        <CardContent>
            <ResumeBuilderForm />
        </CardContent>
      </Card>
    </div>
  );
}
