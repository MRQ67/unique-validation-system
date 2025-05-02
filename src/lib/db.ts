// Mock database for certificate validation
// In a production environment, this would use Vercel KV or another database

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

// Database operations
export const db = {
  // Get certificate by ID
  getCertificate: async (id: string): Promise<Certificate | null> => {
    return certificates[id] || null;
  },
  
  // Get all certificates
  getAllCertificates: async (): Promise<Certificate[]> => {
    return Object.values(certificates);
  },
  
  // Create a new certificate
  createCertificate: async (certificate: Omit<Certificate, 'certificateId'>): Promise<Certificate> => {
    const certificateId = `CERT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCertificate = { ...certificate, certificateId };
    certificates[certificateId] = newCertificate;
    return newCertificate;
  },
  
  // Update a certificate
  updateCertificate: async (id: string, data: Partial<Certificate>): Promise<Certificate | null> => {
    if (!certificates[id]) return null;
    certificates[id] = { ...certificates[id], ...data };
    return certificates[id];
  }
};
