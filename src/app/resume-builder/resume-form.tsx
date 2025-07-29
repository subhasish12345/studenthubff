'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, Loader2, Copy, Check } from 'lucide-react';
import { createResumeAction } from './actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  linkedin: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  github: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  skills: z.array(z.object({ value: z.string().min(1, { message: 'Skill cannot be empty.' }) })).min(1, 'At least one skill is required'),
  experience: z.array(z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    company: z.string().min(1, { message: 'Company is required.' }),
    startDate: z.string().min(1, { message: 'Start date is required.' }),
    endDate: z.string().optional(),
    description: z.string().min(1, { message: 'Description is required.' }),
  })),
  education: z.array(z.object({
    institution: z.string().min(1, { message: 'Institution is required.' }),
    degree: z.string().min(1, { message: 'Degree is required.' }),
    startDate: z.string().min(1, { message: 'Start date is required.' }),
    endDate: z.string().min(1, { message: 'End date is required.' }),
    description: z.string().optional(),
  })),
  projects: z.array(z.object({
    name: z.string().min(1, { message: 'Project name is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  })),
});

type FormValues = z.infer<typeof formSchema>;

export function ResumeBuilderForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', email: '', phone: '', linkedin: '', github: '',
      skills: [{ value: 'React' }, {value: 'Next.js'}],
      experience: [], education: [], projects: [],
    },
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: 'skills' });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: 'projects' });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedResume('');
    const result = await createResumeAction(values);
    setIsLoading(false);

    if (result.success && result.resume) {
      setGeneratedResume(result.resume);
      toast({ title: 'Success!', description: 'Your resume has been generated.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error || 'Something went wrong.' });
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className='font-headline text-lg'>Personal Information</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@email.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="linkedin" render={({ field }) => ( <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/johndoe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="github" render={({ field }) => ( <FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/johndoe" {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className='font-headline text-lg'>Skills</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {skillFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField control={form.control} name={`skills.${index}.value`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} placeholder="e.g. JavaScript" /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendSkill({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className='font-headline text-lg'>Work Experience</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                  <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} placeholder="Software Engineer" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} placeholder="Tech Corp" /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input {...field} placeholder="Jan 2022" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input {...field} placeholder="Present" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Describe your responsibilities and achievements..." /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => removeExp(index)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ title: '', company: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className='font-headline text-lg'>Education</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
               {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                  <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} placeholder="University of Technology" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...field} placeholder="B.S. in Computer Science" /></FormControl><FormMessage /></FormItem>)} />
                   <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`education.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input {...field} placeholder="Aug 2018" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`education.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input {...field} placeholder="May 2022" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                   <FormField control={form.control} name={`education.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Relevant coursework, honors, etc." /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => removeEdu(index)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ institution: '', degree: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className='font-headline text-lg'>Projects</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {projFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                  <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} placeholder="Personal Portfolio Website" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => (<FormItem><FormLabel>Project URL</FormLabel><FormControl><Input {...field} placeholder="https://my-portfolio.com" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Describe the project, its purpose, and the technologies used." /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => removeProj(index)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendProj({ name: '', description: '', url: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate Resume'}
        </Button>
      </form>
    </Form>

    {generatedResume && (
        <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Generated Resume</CardTitle>
                    <CardDescription>You can copy the content and paste it into a document.</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent>
                <pre className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap font-sans text-sm">{generatedResume}</pre>
            </CardContent>
        </Card>
    )}
    </>
  );
}
