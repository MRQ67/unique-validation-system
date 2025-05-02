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
      <header className="bg-blue-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Certificate Validator</h1>
          <Link 
            href="/admin" 
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Verify Certificate Authenticity</h2>
          <p className="text-gray-600 mb-8">
            Enter the certificate ID or scan the QR code on your certificate to verify its authenticity.
          </p>

          <div className="mb-8">
            <form className="flex flex-col items-center" action="/validate" method="get">
              <div className="w-full max-w-md mb-4">
                <input
                  type="text"
                  name="id"
                  placeholder="Enter Certificate ID (e.g., CERT-1234-5678)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Verify Certificate
              </button>
            </form>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="flex items-center justify-center mx-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              {showScanner ? "Hide QR Scanner" : "Scan QR Code"}
            </button>
            
            {showScanner && (
              <div className="mt-4">
                <QRCodeScanner />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Scan QR Code</h4>
                <p className="text-gray-600 text-sm text-center">Scan the QR code on your certificate</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Verify Details</h4>
                <p className="text-gray-600 text-sm text-center">Our system verifies the certificate details</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Confirmation</h4>
                <p className="text-gray-600 text-sm text-center">Get instant confirmation of authenticity</p>
              </div>
            </div>
          </div>
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
