'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

      // Redirect to the certificate detail page
      router.push(`/admin/certificate/${result.certificateId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-800">Create Certificate</h2>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Creating...' : 'Create Certificate'}
              </button>
            </div>
          </form>
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
