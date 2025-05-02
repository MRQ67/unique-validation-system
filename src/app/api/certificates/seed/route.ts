import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// This endpoint seeds a specific certificate
export async function GET(request: NextRequest) {
  try {
    // Check if authenticated (only admin should be able to seed)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Certificate data
    const certificate = {
      certificateId: 'CERT-4788-5830',
      studentName: 'Fuad Abdella',
      courseName: 'Software Engineering',
      issueDate: '2025-05-03',
      expiryDate: '2029-06-02',
      status: 'valid'
    };

    // Add to KV database if in production
    if (process.env.VERCEL_KV_URL) {
      await kv.set(`certificate:${certificate.certificateId}`, certificate);
      return NextResponse.json({ 
        success: true, 
        message: `Certificate ${certificate.certificateId} added to KV database`,
        certificate
      });
    } else {
      // In development, we'll just use the in-memory database which is already updated
      return NextResponse.json({ 
        success: true, 
        message: `Certificate ${certificate.certificateId} is available in development mode`,
        certificate
      });
    }
  } catch (error) {
    console.error('Error seeding certificate:', error);
    return NextResponse.json({ 
      error: 'Failed to seed certificate', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
