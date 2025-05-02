'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the QR code scanner component to avoid SSR issues
const QRCodeScanner = dynamic(() => import("@/components/QRCodeScanner"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
      <p>Loading QR code scanner...</p>
    </div>
  ),
});

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md text-gray-800 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/unique.svg" 
              alt="Unique Logo" 
              width={40} 
              height={40} 
              className="mr-3"
            />
            <h1 className="text-2xl font-bold text-green-600">Unique Validation</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Certificate Verification</h2>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4 text-center">
              Verify the authenticity of your certificate by entering the certificate ID or scanning the QR code.
            </p>
            
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setShowScanner(false)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  !showScanner 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Enter ID
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showScanner 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Scan QR Code
              </button>
            </div>
          </div>
          
          {!showScanner ? (
            <form 
              action="/validate"
              method="get"
              className="space-y-6"
            >
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate ID
                </label>
                <input
                  id="certificateId"
                  name="id"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your certificate ID"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                >
                  Verify Certificate
                </button>
              </div>
            </form>
          ) : (
            <QRCodeScanner />
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
