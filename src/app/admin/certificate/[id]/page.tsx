'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { generateQRCode } from '@/lib/qrcode';
import { toPng } from 'html-to-image';

interface Certificate {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'revoked' | 'expired';
  email?: string;
}

export default function CertificateDetailPage({ params }: { params: { id: string } }) {
  const certificateId = params.id;
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`/api/certificates/validate?id=${encodeURIComponent(certificateId)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch certificate');
        }
        
        if (!data.valid || !data.certificate) {
          throw new Error('Certificate not found or invalid');
        }
        
        setCertificate(data.certificate);
        
        // Generate QR code for validation URL
        const validationUrl = `${window.location.origin}/validate/${certificateId}`;
        const qrCodeDataUrl = await generateQRCode(validationUrl);
        setQrCode(qrCodeDataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1.0,
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = `certificate-${certificateId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating certificate image:', err);
      alert('Failed to download certificate. Please try again.');
    }
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
            Back to Admin
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <div className="mt-4">
              <Link 
                href="/admin" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Return to Admin
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && certificate && qrCode && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Certificate Preview</h2>
              <button
                onClick={downloadCertificate}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Certificate
              </button>
            </div>

            {/* Certificate Template */}
            <div 
              ref={certificateRef} 
              className="bg-white border-8 border-blue-200 rounded-lg p-8 shadow-lg mb-8"
              style={{ 
                backgroundImage: 'radial-gradient(circle, rgba(235,245,255,1) 0%, rgba(255,255,255,1) 100%)',
                minHeight: '600px'
              }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">Certificate of Completion</h1>
                <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-2">This is to certify that</p>
                <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">{certificate.studentName}</h2>
                <p className="text-gray-600 mb-4">has successfully completed the course</p>
                <h3 className="text-2xl font-bold text-blue-700 mb-2">"{certificate.courseName}"</h3>
                <p className="text-gray-600">
                  on {formatDate(certificate.issueDate)}
                  {certificate.expiryDate && ` (Valid until ${formatDate(certificate.expiryDate)})`}
                </p>
              </div>
              
              <div className="flex justify-between items-end mt-16">
                <div>
                  <div className="w-40 h-px bg-gray-400 mb-2"></div>
                  <p className="text-gray-600">Authorized Signature</p>
                </div>
                
                <div className="text-center">
                  <img 
                    src={qrCode} 
                    alt="Certificate Validation QR Code" 
                    className="w-32 h-32 mx-auto mb-2"
                  />
                  <p className="text-xs text-gray-500">Scan to verify</p>
                  <p className="text-xs text-gray-500">{certificate.certificateId}</p>
                </div>
                
                <div>
                  <div className="w-40 h-px bg-gray-400 mb-2"></div>
                  <p className="text-gray-600">Date Issued</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Certificate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Certificate ID</p>
                  <p className="font-medium text-gray-800 mb-4">{certificate.certificateId}</p>
                  
                  <p className="text-gray-500 text-sm mb-1">Student Name</p>
                  <p className="font-medium text-gray-800 mb-4">{certificate.studentName}</p>
                  
                  <p className="text-gray-500 text-sm mb-1">Course</p>
                  <p className="font-medium text-gray-800 mb-4">{certificate.courseName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Issue Date</p>
                  <p className="font-medium text-gray-800 mb-4">{formatDate(certificate.issueDate)}</p>
                  
                  {certificate.expiryDate && (
                    <>
                      <p className="text-gray-500 text-sm mb-1">Expiry Date</p>
                      <p className="font-medium text-gray-800 mb-4">{formatDate(certificate.expiryDate)}</p>
                    </>
                  )}
                  
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  <p className="font-medium text-green-600 mb-4 capitalize">{certificate.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Validation Link</h3>
              <p className="text-gray-600 mb-4">
                Share this link to allow others to verify this certificate:
              </p>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/validate/${certificateId}`}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/validate/${certificateId}`);
                    alert('Validation link copied to clipboard!');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-100 p-6 text-center text-gray-600 mt-8">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Certificate Validator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
