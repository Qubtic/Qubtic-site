import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/mail';
import { addInquiryDb } from '@/lib/store';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  service: z.string().min(1, 'Service is required'),
  budget: z.string().min(1, 'Budget is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // 1. Save inquiry into Supabase database
    try {
      await addInquiryDb(validatedData);
    } catch (storeErr) {
      console.warn('Failed saving inquiry to database:', storeErr);
    }

    // 2. Attempt email notification via SMTP (safe execution)
    await sendContactEmail(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully! We will reach out within 24 business hours.',
    });
  } catch (error: any) {
    console.error('Error handling contact form submission:', error);

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
        message: 'Failed to submit inquiry. Please try again or email us directly at hello@qubtic.tech.',
      },
      { status: 500 }
    );
  }
}
