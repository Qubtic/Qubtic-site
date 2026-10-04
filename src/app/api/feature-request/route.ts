import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendFeatureRequestEmail } from '@/lib/mail';
import { addFeatureRequestDb } from '@/lib/store';

const featureRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  category: z.string().min(1, 'Please select a feature category'),
  useCase: z.string().min(1, 'Please select a use case'),
  title: z.string().min(3, 'Feature title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a description of at least 10 characters'),
  referenceUrl: z.string().optional(),
  priority: z.string().min(1, 'Please select a priority'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = featureRequestSchema.parse(body);

    // 1. Save to DB & JSON store
    try {
      await addFeatureRequestDb(validatedData);
    } catch (storeErr) {
      console.warn('Failed saving feature request to database:', storeErr);
    }

    // 2. Send email notifications
    await sendFeatureRequestEmail(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Feature request submitted successfully! Our Framer plugin team will review it during weekly triage.',
    });
  } catch (error: any) {
    console.error('Error handling feature request form submission:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form input',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit feature request. Please try again or email us directly at framedrop@qubtic.tech.',
      },
      { status: 500 }
    );
  }
}
