// src/ai/flows/generate-resume.ts
'use server';
/**
 * @fileOverview A resume generation AI agent.
 *
 * - generateResume - A function that handles the resume generation process.
 * - GenerateResumeInput - The input type for the generateResume function.
 * - GenerateResumeOutput - The return type for the generateResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeInputSchema = z.object({
  name: z.string().describe('The name of the resume owner.'),
  email: z.string().email().describe('The email address of the resume owner.'),
  phone: z.string().describe('The phone number of the resume owner.'),
  linkedin: z.string().optional().describe('The LinkedIn profile URL of the resume owner.'),
  github: z.string().optional().describe('The GitHub profile URL of the resume owner.'),
  skills: z.array(z.string()).describe('A list of skills of the resume owner.'),
  experience: z.array(z.object({
    title: z.string().describe('The job title.'),
    company: z.string().describe('The company name.'),
    startDate: z.string().describe('The start date of the job.'),
    endDate: z.string().optional().describe('The end date of the job, or leave blank if current.'),
    description: z.string().describe('The job description.'),
  })).describe('A list of work experiences of the resume owner.'),
  education: z.array(z.object({
    institution: z.string().describe('The name of the institution.'),
    degree: z.string().describe('The degree name.'),
    startDate: z.string().describe('The start date of the education.'),
    endDate: z.string().describe('The end date of the education.'),
    description: z.string().optional().describe('The description of the education.'),
  })).describe('A list of education records of the resume owner.'),
  projects: z.array(z.object({
    name: z.string().describe('The name of the project.'),
    description: z.string().describe('The description of the project.'),
    url: z.string().optional().describe('The URL of the project.'),
  })).describe('A list of projects of the resume owner.'),
}).strict();

export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resume: z.string().describe('The generated resume content.'),
});

export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;

export async function generateResume(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
  return generateResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumePrompt',
  input: {schema: GenerateResumeInputSchema},
  output: {schema: GenerateResumeOutputSchema},
  prompt: `You are a professional resume writer. Create a compelling resume based on the information provided. Highlight the skills, experiences, and education of the candidate.

Candidate Name: {{{name}}}
Email: {{{email}}}
Phone: {{{phone}}}
{{#if linkedin}}LinkedIn: {{{linkedin}}}{{/if}}
{{#if github}}GitHub: {{{github}}}{{/if}}

Skills:
{{#each skills}} - {{{this}}}
{{/each}}

Experience:
{{#each experience}}
  - Title: {{{title}}}
    Company: {{{company}}}
    Dates: {{{startDate}}} - {{#if endDate}}{{{endDate}}}{{else}}Present{{/if}}
    Description: {{{description}}}
{{/each}}

Education:
{{#each education}}
  - Institution: {{{institution}}}
    Degree: {{{degree}}}
    Dates: {{{startDate}}} - {{{endDate}}}
    {{#if description}}Description: {{{description}}}{{/if}}
{{/each}}

Projects:
{{#each projects}}
  - Name: {{{name}}}
    Description: {{{description}}}
    {{#if url}}URL: {{{url}}}{{/if}}
{{/each}}
`,
});

const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResumeFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

