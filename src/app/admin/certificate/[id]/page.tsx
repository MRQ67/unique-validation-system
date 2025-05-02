'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toPng } from 'html-to-image';
import { generateCertificateHTML } from '@/lib/certificate';
import { generateQRCode } from '@/lib/qrcode';

interface Certificate {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'revoked' | 'expired';
  email?: string;
}

export default function CertificateDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const certificateId = params?.id as string;
  
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [transparentQrCode, setTransparentQrCode] = useState<string | null>(null);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const certificateRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchCertificate();
    }
  }, [status, router, certificateId]);

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/validate?id=${certificateId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch certificate');
      }
      
      if (!data.certificate) {
        throw new Error('Certificate not found');
      }
      
      setCertificate(data.certificate);
      
      // Generate QR code
      const validationUrl = `${window.location.origin}/validate/${certificateId}`;
      const qrCodeDataUrl = await generateQRCode(validationUrl, false);
      const transparentQrCodeDataUrl = await generateQRCode(validationUrl, true);
      setQrCode(qrCodeDataUrl);
      setTransparentQrCode(transparentQrCodeDataUrl);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificateImage = async () => {
    if (!certificateRef.current || !certificate) return;
    
    try {
      const dataUrl = await toPng(certificateRef.current, { quality: 0.95 });
      setCertificateImage(dataUrl);
    } catch (err) {
      console.error('Error generating certificate image:', err);
      setError('Failed to generate certificate image');
    }
  };

  useEffect(() => {
    if (certificate && certificateRef.current) {
      generateCertificateImage();
    }
  }, [certificate, certificateRef]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = async () => {
    const validationUrl = `${window.location.origin}/validate/${certificateId}`;
    
    try {
      await navigator.clipboard.writeText(validationUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = (transparent: boolean = false) => {
    const qrCodeUrl = transparent ? transparentQrCode : qrCode;
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `certificate-qr-${transparent ? 'transparent' : 'white'}-${certificateId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCertificate = () => {
    if (!certificateImage) return;
    
    const link = document.createElement('a');
    link.href = certificateImage;
    link.download = `certificate-${certificateId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-blue-100 transition-colors">
            Certificate Validator
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-white bg-blue-700 px-3 py-1 rounded-md text-sm">Admin Portal</span>
            <button 
              onClick={() => {
                fetch('/api/auth/signout', { method: 'POST' })
                  .then(() => router.push('/login'));
              }}
              className="text-white bg-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Certificate Details</h2>
            <Link 
              href="/admin" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && certificate && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Certificate Preview</h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div 
                      ref={certificateRef}
                      className="w-full aspect-[1.4142/1] bg-white"
                      dangerouslySetInnerHTML={{ 
                        __html: generateCertificateHTML({
                          studentName: certificate.studentName,
                          courseName: certificate.courseName,
                          certificateId: certificate.certificateId,
                          issueDate: formatDate(certificate.issueDate),
                          qrCodeUrl: transparentQrCode || ''
                        })
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={downloadCertificate}
                      disabled={!certificateImage}
                      className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center w-full"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Certificate
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Certificate Information</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Certificate ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">{certificate.certificateId}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{certificate.studentName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Course Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{certificate.courseName}</dd>
                      </div>
                      {certificate.email && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="mt-1 text-sm text-gray-900">{certificate.email}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(certificate.issueDate)}</dd>
                      </div>
                      {certificate.expiryDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(certificate.expiryDate)}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            certificate.status === 'valid' ? 'bg-green-100 text-green-800' :
                            certificate.status === 'revoked' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {certificate.status}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">QR Code</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    {qrCode && (
                      <div className="flex justify-center mb-4">
                        <img src={qrCode} alt="Certificate QR Code" className="w-48 h-48" />
                      </div>
                    )}
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => downloadQRCode(false)}
                        disabled={!qrCode}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR Code (White)
                      </button>
                      <button
                        onClick={() => downloadQRCode(true)}
                        disabled={!transparentQrCode}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR Code (Transparent)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Validation Link</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        value={`${window.location.origin}/validate/${certificateId}`}
                        readOnly
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                      >
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Share this link with anyone who needs to verify this certificate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
