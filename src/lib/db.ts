// Database implementation with Vercel KV support
// Fallback to in-memory storage for development/demo

export interface Certificate {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'revoked' | 'expired';
  email?: string;
}

// Mock database for the hackathon demo
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

// Database operations
export const db = {
  // Get certificate by ID
  getCertificate: async (id: string): Promise<Certificate | null> => {
    if (isProduction) {
      try {
        // In production, you would use Vercel KV or another database
        // This is a placeholder for the actual implementation
        // Example with Vercel KV: return await kv.get(`certificate:${id}`);
        
        // For now, we'll still use the in-memory database in production
        return certificates[id] || null;
      } catch (error) {
        console.error('Error fetching certificate:', error);
        return null;
      }
    }
    
    // In development, use in-memory database
    return certificates[id] || null;
  },
  
  // Get all certificates
  getAllCertificates: async (): Promise<Certificate[]> => {
    if (isProduction) {
      try {
        // In production, you would use Vercel KV or another database
        // Example with Vercel KV: return await kv.hgetall('certificates');
        
        // For now, we'll still use the in-memory database in production
        return Object.values(certificates);
      } catch (error) {
        console.error('Error fetching all certificates:', error);
        return [];
      }
    }
    
    // In development, use in-memory database
    return Object.values(certificates);
  },
  
  // Create a new certificate
  createCertificate: async (certificate: Omit<Certificate, 'certificateId'>): Promise<Certificate> => {
    const certificateId = `CERT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCertificate = { ...certificate, certificateId };
    
    if (isProduction) {
      try {
        // In production, you would use Vercel KV or another database
        // Example with Vercel KV: 
        // await kv.set(`certificate:${certificateId}`, newCertificate);
        // await kv.hset('certificates', { [certificateId]: newCertificate });
        
        // For now, we'll still use the in-memory database in production
        certificates[certificateId] = newCertificate;
      } catch (error) {
        console.error('Error creating certificate:', error);
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
    
    if (isProduction) {
      try {
        // In production, you would use Vercel KV or another database
        // Example with Vercel KV: 
        // await kv.set(`certificate:${id}`, updatedCertificate);
        // await kv.hset('certificates', { [id]: updatedCertificate });
        
        // For now, we'll still use the in-memory database in production
        certificates[id] = updatedCertificate;
      } catch (error) {
        console.error('Error updating certificate:', error);
        return null;
      }
    } else {
      // In development, use in-memory database
      certificates[id] = updatedCertificate;
    }
    
    return updatedCertificate;
  }
};
