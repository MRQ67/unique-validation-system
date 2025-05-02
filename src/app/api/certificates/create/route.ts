import { NextRequest, NextResponse } from 'next/server';
import { db, Certificate } from '@/lib/db';
import { z } from 'zod';

// Schema for certificate creation
const certificateSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  courseName: z.string().min(1, "Course name is required"),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be in YYYY-MM-DD format"),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format").optional(),
  email: z.string().email("Invalid email address").optional(),
  status: z.enum(["valid", "revoked", "expired"]).default("valid")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const result = certificateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid certificate data', issues: result.error.issues },
        { status: 400 }
      );
    }
    
    // Create the certificate
    const certificate = await db.createCertificate(result.data);
    
    return NextResponse.json({ 
      message: 'Certificate created successfully', 
      certificate 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    );
  }
}
