'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Certificate {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'revoked' | 'expired';
  email?: string;
}

interface ValidationResult {
  valid: boolean;
  certificate?: Certificate;
  message: string;
  error?: string;
}

export default function ValidateByIdPage() {
  const params = useParams();
  const certificateId = params?.id as string;
  
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!certificateId) {
      setError('Certificate ID is required');
      return;
    }

    const validateCertificate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/certificates/validate?id=${encodeURIComponent(certificateId)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to validate certificate');
        }
        
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    validateCertificate();
  }, [certificateId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md text-gray-800 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center hover:text-green-600 transition-colors">
            <Image 
              src="/unique.svg" 
              alt="Unique Logo" 
              width={40} 
              height={40} 
              className="mr-3"
            />
            <span className="text-2xl font-bold text-green-600">Unique Validation</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Certificate Verification Result</h2>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <p className="font-medium">Error</p>
              <p>{error}</p>
              <div className="mt-4">
                <Link 
                  href="/" 
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                >
                  Try Again
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && result && (
            <div>
              {result.valid && result.certificate ? (
                <div>
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-medium">{result.message}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Certificate Information</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Certificate ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">{result.certificate.certificateId}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.certificate.status === 'valid' ? 'bg-green-100 text-green-800' :
                            result.certificate.status === 'revoked' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.certificate.status}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{result.certificate.studentName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Course Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{result.certificate.courseName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(result.certificate.issueDate)}</dd>
                      </div>
                      {result.certificate.expiryDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(result.certificate.expiryDate)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="font-medium">{result.message}</p>
                </div>
              )}
              
              <div className="flex justify-center mt-8">
                <Link 
                  href="/" 
                  className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
                >
                  Verify Another Certificate
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-100 p-6 text-center text-gray-600">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Unique Validation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
