'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// We'll use proper types from the library
type DecodeContinuouslyCallback = (result: Result | undefined, error: Exception | undefined) => void;

// These are placeholders for the actual types from the library
interface Result {
  getText(): string;
}

interface Exception {
  message: string;
}

export default function QRCodeScanner() {
  const router = useRouter();
  const [hasCamera, setHasCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader, setCodeReader] = useState<any>(null);

  useEffect(() => {
    // Check if the browser supports the MediaDevices API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Camera access granted
          setHasCamera(true);
          // Stop the stream immediately, we'll start it again when scanning
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.error('Camera access error:', err);
          setError('Unable to access camera. Please ensure you have granted camera permissions.');
          setHasCamera(false);
        });
    } else {
      setError('Your browser does not support camera access for QR code scanning.');
      setHasCamera(false);
    }
  }, []);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (scanning && codeReader) {
        stopScanning();
      }
    };
  }, [scanning, codeReader]);

  const startScanning = async () => {
    setScanning(true);
    setError(null);

    try {
      // Dynamically import the QR code scanner library
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      
      const reader = new BrowserQRCodeReader();
      setCodeReader(reader);
      
      const videoElement = document.getElementById('qr-video') as HTMLVideoElement;
      
      if (!videoElement) {
        throw new Error('Video element not found');
      }

      // Using the proper callback type
      const controls = await reader.decodeFromVideoDevice(
        undefined, 
        videoElement, 
        (result, error) => {
          if (result) {
            // QR code detected, extract the URL
            const text = result.getText();
            console.log('QR Code detected:', text);
            
            // Stop scanning
            stopScanning();
            
            // Check if the QR code contains a valid certificate URL
            if (text.includes('/validate/')) {
              router.push(text);
            } else {
              // Try to extract a certificate ID
              const certificateIdMatch = text.match(/CERT-\d{4}-\d{4}/);
              if (certificateIdMatch) {
                router.push(`/validate?id=${certificateIdMatch[0]}`);
              } else {
                setError('Invalid QR code. Please scan a valid certificate QR code.');
              }
            }
          }
          
          if (error) {
            console.error('QR Code scanning error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error initializing QR scanner:', err);
      setError('Failed to initialize QR code scanner. Please try again.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      try {
        // Instead of using reset(), we'll properly clean up
        codeReader.stopAsyncDecode();
        // Also release camera resources
        const videoElement = document.getElementById('qr-video') as HTMLVideoElement;
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoElement.srcObject = null;
        }
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      }
    }
    setScanning(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">QR Code Scanner</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {hasCamera ? (
          <>
            <div className="relative mb-4">
              {scanning ? (
                <div className="aspect-square w-full bg-gray-100 rounded-md overflow-hidden">
                  <video
                    id="qr-video"
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  ></video>
                  <div className="absolute inset-0 border-2 border-blue-500 opacity-50 pointer-events-none"></div>
                </div>
              ) : (
                <div className="aspect-square w-full bg-gray-100 rounded-md flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              {scanning ? (
                <button
                  onClick={stopScanning}
                  className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
                >
                  Stop Scanning
                </button>
              ) : (
                <button
                  onClick={startScanning}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Scanning
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-600 mb-2">Camera access is required for QR code scanning</p>
            <p className="text-gray-500 text-sm">Please ensure you have granted camera permissions to this website</p>
          </div>
        )}
        
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Point your camera at a certificate QR code to verify its authenticity</p>
        </div>
      </div>
    </div>
  );
}
