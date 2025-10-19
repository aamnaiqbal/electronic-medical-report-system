'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import { RegisterData } from '@/lib/auth';
import { getAuthHeader } from '@/lib/auth';

export default function CreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Array<{field: string, message: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (data: RegisterData) => {
    try {
      setError('');
      setValidationErrors([]);
      setSuccess(false);
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setValidationErrors(errorData.errors);
          setError('Please fix the validation errors below');
        } else {
          setError(errorData.message || 'Registration failed');
        }
        return;
      }

      const result = await response.json();
      setSuccess(true);

      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
            <p className="text-gray-600 mt-1">
              Register a new doctor or patient in the system
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <svg
            className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">
              User created successfully! Redirecting to user list...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
              {validationErrors.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {validationErrors.map((err, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start">
                      <span className="font-semibold mr-2">
                        {err.field.replace('body.', '')}:
                      </span>
                      <span>{err.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
      </div>
    </div>
  );
}
