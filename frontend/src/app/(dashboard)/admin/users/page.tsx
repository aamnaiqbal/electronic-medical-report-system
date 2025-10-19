'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { fetchUsers, setUserFilters } from '@/lib/redux/slices/adminSlice';
import UserTable from '@/components/admin/UserTable';

export default function UsersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, usersLoading, usersError, userFilters } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchUsers(userFilters));
  }, [dispatch, userFilters]);

  if (usersError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
            <div className="mt-2 text-sm text-red-700">{usersError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all users in the system including admins, doctors, and patients
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/users/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New User
        </button>
      </div>

      {/* Helpful tip when no users yet */}
      {!usersLoading && users.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Your First User
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Click the <strong className="text-blue-700">"Create New User"</strong> button above to add doctors and patients to your system.
              </p>
              <div className="bg-white rounded-md p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">You can create:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <strong className="text-blue-700">Doctors</strong> - Medical professionals who can manage appointments and patient records
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <strong className="text-green-700">Patients</strong> - People who can book appointments and view their medical records
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      <UserTable />
    </div>
  );
}
