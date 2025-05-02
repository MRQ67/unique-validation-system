// Database implementation with Vercel KV support
import { kv } from '@vercel/kv';

export interface Certificate {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'revoked' | 'expired';
  email?: string;
}

// Mock database for local development
const certificates: Record<string, Certificate> = {
  'CERT-1234-5678': {
    certificateId: 'CERT-1234-5678',
    studentName: 'John Doe',
    courseName: 'Advanced Web Development',
    issueDate: '2025-04-15',
    status: 'valid',
    email: 'john.doe@example.com'
  },
  'CERT-8765-4321': {
    certificateId: 'CERT-8765-4321',
    studentName: 'Jane Smith',
    courseName: 'Data Science Fundamentals',
    issueDate: '2025-03-20',
    expiryDate: '2026-03-20',
    status: 'valid',
    email: 'jane.smith@example.com'
  },
  'CERT-9999-0000': {
    certificateId: 'CERT-9999-0000',
    studentName: 'Bob Johnson',
    courseName: 'Cybersecurity Essentials',
    issueDate: '2024-12-10',
    status: 'revoked',
    email: 'bob.johnson@example.com'
  }
};

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';
const useKV = isProduction && process.env.VERCEL_KV_URL;

// Database operations
export const db = {
  // Get certificate by ID
  getCertificate: async (id: string): Promise<Certificate | null> => {
    if (useKV) {
      try {
        // Use Vercel KV in production
        const certificate = await kv.get<Certificate>(`certificate:${id}`);
        return certificate || null;
      } catch (error) {
        console.error('Error fetching certificate from KV:', error);
        // Fallback to in-memory if KV fails
        return certificates[id] || null;
      }
    }
    
    // In development, use in-memory database
    return certificates[id] || null;
  },
  
  // Get all certificates
  getAllCertificates: async (): Promise<Certificate[]> => {
    if (useKV) {
      try {
        // Use Vercel KV in production
        const certificateKeys = await kv.keys('certificate:*');
        if (certificateKeys.length === 0) {
          // If no certificates exist, seed with mock data in production
          await Promise.all(
            Object.values(certificates).map(cert => 
              kv.set(`certificate:${cert.certificateId}`, cert)
            )
          );
          return Object.values(certificates);
        }
        
        const allCertificates = await Promise.all(
          certificateKeys.map(key => kv.get<Certificate>(key))
        );
        
        return allCertificates.filter(Boolean) as Certificate[];
      } catch (error) {
        console.error('Error fetching all certificates from KV:', error);
        // Fallback to in-memory if KV fails
        return Object.values(certificates);
      }
    }
    
    // In development, use in-memory database
    return Object.values(certificates);
  },
  
  // Create a new certificate
  createCertificate: async (certificate: Omit<Certificate, 'certificateId'>): Promise<Certificate> => {
    const certificateId = `CERT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCertificate = { ...certificate, certificateId };
    
    if (useKV) {
      try {
        // Use Vercel KV in production
        await kv.set(`certificate:${certificateId}`, newCertificate);
      } catch (error) {
        console.error('Error creating certificate in KV:', error);
        // Fallback to in-memory if KV fails
        certificates[certificateId] = newCertificate;
      }
    } else {
      // In development, use in-memory database
      certificates[certificateId] = newCertificate;
    }
    
    return newCertificate;
  },
  
  // Update a certificate
  updateCertificate: async (id: string, data: Partial<Certificate>): Promise<Certificate | null> => {
    const certificate = await db.getCertificate(id);
    
    if (!certificate) {
      return null;
    }
    
    const updatedCertificate = { ...certificate, ...data };
    
    if (useKV) {
      try {
        // Use Vercel KV in production
        await kv.set(`certificate:${id}`, updatedCertificate);
      } catch (error) {
        console.error('Error updating certificate in KV:', error);
        // Fallback to in-memory if KV fails
        certificates[id] = updatedCertificate;
      }
    } else {
      // In development, use in-memory database
      certificates[id] = updatedCertificate;
    }
    
    return updatedCertificate;
  }
};
