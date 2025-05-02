'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

export default function ValidatePage() {
  const searchParams = useSearchParams();
  const certificateId = searchParams.get('id');
  
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
      <header className="bg-blue-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-blue-100 transition-colors">
            Certificate Validator
          </Link>
          <Link 
            href="/admin" 
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Certificate Verification Result</h2>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <p className="font-medium">Verification Failed</p>
              <p>{error}</p>
              <div className="mt-4 text-center">
                <Link 
                  href="/" 
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && result && (
            <>
              {result.valid ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-medium">{result.message}</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="font-medium">{result.message}</p>
                </div>
              )}

              {result.valid && result.certificate && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-600 text-white p-4">
                    <h3 className="text-xl font-semibold">Certificate Details</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Certificate ID</p>
                        <p className="font-medium text-gray-800 mb-4">{result.certificate.certificateId}</p>
                        
                        <p className="text-gray-500 text-sm mb-1">Student Name</p>
                        <p className="font-medium text-gray-800 mb-4">{result.certificate.studentName}</p>
                        
                        <p className="text-gray-500 text-sm mb-1">Course</p>
                        <p className="font-medium text-gray-800 mb-4">{result.certificate.courseName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Issue Date</p>
                        <p className="font-medium text-gray-800 mb-4">{formatDate(result.certificate.issueDate)}</p>
                        
                        {result.certificate.expiryDate && (
                          <>
                            <p className="text-gray-500 text-sm mb-1">Expiry Date</p>
                            <p className="font-medium text-gray-800 mb-4">{formatDate(result.certificate.expiryDate)}</p>
                          </>
                        )}
                        
                        <p className="text-gray-500 text-sm mb-1">Status</p>
                        <p className="font-medium text-green-600 mb-4 capitalize">{result.certificate.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <Link 
                  href="/" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Verify Another Certificate
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-gray-100 p-6 text-center text-gray-600">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Certificate Validator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
