import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const certificates = await db.getAllCertificates();
    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Error listing certificates:', error);
    return NextResponse.json(
      { error: 'Failed to list certificates' },
      { status: 500 }
    );
  }
}
