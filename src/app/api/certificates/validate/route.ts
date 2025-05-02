import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Certificate ID is required' },
      { status: 400 }
    );
  }

  try {
    const certificate = await db.getCertificate(id);
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found', valid: false },
        { status: 404 }
      );
    }

    // Check if certificate is valid
    const isValid = certificate.status === 'valid';
    
    return NextResponse.json({
      valid: isValid,
      certificate: isValid ? certificate : { certificateId: id, status: certificate.status },
      message: isValid 
        ? 'Certificate is valid' 
        : `Certificate is ${certificate.status}`
    });
  } catch (error) {
    console.error('Error validating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to validate certificate', valid: false },
      { status: 500 }
    );
  }
}
