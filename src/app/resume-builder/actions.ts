'use server';

import { generateResume, type GenerateResumeInput, type GenerateResumeOutput } from '@/ai/flows/generate-resume';
import { z } from 'zod';

const GenerateResumeInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.object({ value: z.string().min(1, 'Skill cannot be empty') })).min(1, 'At least one skill is required'),
  experience: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    company: z.string().min(1, 'Company is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
  })),
  education: z.array(z.object({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string().optional(),
  })),
  projects: z.array(z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Description is required'),
    url: z.string().url().optional().or(z.literal('')),
  })),
});


export async function createResumeAction(data: unknown): Promise<{ success: boolean, resume?: string, error?: string }> {
  const validation = GenerateResumeInputSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  const validatedData = validation.data;
  
  const apiInput: GenerateResumeInput = {
    ...validatedData,
    skills: validatedData.skills.map(s => s.value),
  };

  try {
    const result: GenerateResumeOutput = await generateResume(apiInput);
    return { success: true, resume: result.resume };
  } catch (error) {
    console.error("Error generating resume:", error);
    return { success: false, error: 'Failed to generate resume. Please try again later.' };
  }
}
