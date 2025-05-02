'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

// Define the schema for certificate creation
const certificateSchema = z.object({
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  courseName: z.string().min(2, 'Course name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  issueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  expiryDate: z.string().refine(val => val === '' || !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

export default function CreateCertificatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      studentName: '',
      courseName: '',
      email: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
    },
  });

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const onSubmit = async (data: CertificateFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/certificates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create certificate');
      }

      // Check if certificateId exists in the response
      if (!result.certificateId) {
        throw new Error('Certificate ID not returned from server');
      }

      // Redirect to the certificate detail page
      router.push(`/admin/certificate/${result.certificateId}`);
    } catch (err) {
      console.error('Certificate creation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md text-gray-800 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/admin" className="flex items-center hover:text-green-600 transition-colors">
            <Image 
              src="/unique.svg" 
              alt="Unique Logo" 
              width={40} 
              height={40} 
              className="mr-3"
            />
            <span className="text-2xl font-bold text-green-600">Unique Validation</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-white bg-green-600 px-3 py-1 rounded-md text-sm">Admin Portal</span>
            <button 
              onClick={() => {
                fetch('/api/auth/signout', { method: 'POST' })
                  .then(() => router.push('/login'));
              }}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New Certificate</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                id="studentName"
                type="text"
                {...register('studentName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter student name"
              />
              {errors.studentName && (
                <p className="mt-1 text-sm text-red-600">{errors.studentName.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                id="courseName"
                type="text"
                {...register('courseName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter course name"
              />
              {errors.courseName && (
                <p className="mt-1 text-sm text-red-600">{errors.courseName.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                id="issueDate"
                type="date"
                {...register('issueDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                id="expiryDate"
                type="date"
                {...register('expiryDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Certificate'}
              </button>
            </div>
          </form>
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
