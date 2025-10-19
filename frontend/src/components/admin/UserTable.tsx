'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { setUserFilters } from '@/lib/redux/slices/adminSlice';
import {
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface UserTableProps {}

export default function UserTable({}: UserTableProps) {
  const dispatch = useAppDispatch();
  const { users, usersLoading, usersPagination, userFilters } = useAppSelector(
    (state) => state.admin
  );

  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRole, setSelectedRole] = useState<string>(userFilters.role);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (search: string) => {
    dispatch(setUserFilters({ search, page: 1 }));
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    dispatch(setUserFilters({ role, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setUserFilters({ page }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (usersLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with filters */}
      <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900">Users</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Search users..."
              value={userFilters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={selectedRole}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  ID
                  {sortField === 'id' && (
                    sortOrder === 'asc' ? (
                      <ChevronUpIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center">
                  Name
                  {sortField === 'firstName' && (
                    sortOrder === 'asc' ? (
                      <ChevronUpIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {sortField === 'email' && (
                    sortOrder === 'asc' ? (
                      <ChevronUpIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center">
                  Role
                  {sortField === 'role' && (
                    sortOrder === 'asc' ? (
                      <ChevronUpIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created Date
                  {sortField === 'createdAt' && (
                    sortOrder === 'asc' ? (
                      <ChevronUpIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Get started by creating your first user.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {usersPagination && usersPagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(usersPagination.page - 1) * usersPagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)}
              </span>{' '}
              of <span className="font-medium">{usersPagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(usersPagination.page - 1)}
                disabled={usersPagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(usersPagination.page + 1)}
                disabled={usersPagination.page === usersPagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
