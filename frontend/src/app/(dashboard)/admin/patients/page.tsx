'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { fetchPatients, setPatientFilters } from '@/lib/redux/slices/adminSlice';
import {
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  PhoneIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function PatientsPage() {
  const dispatch = useAppDispatch();
  const { patients, patientsLoading, patientsError, patientFilters } = useAppSelector(
    (state) => state.admin
  );

  const [searchTerm, setSearchTerm] = useState(patientFilters.search);
  const [bloodGroupFilter, setBloodGroupFilter] = useState(patientFilters.bloodGroup);

  useEffect(() => {
    dispatch(fetchPatients(patientFilters));
  }, [dispatch, patientFilters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(setPatientFilters({ search: value, page: 1 }));
  };

  const handleBloodGroupFilter = (value: string) => {
    setBloodGroupFilter(value);
    dispatch(setPatientFilters({ bloodGroup: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPatientFilters({ page }));
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    switch (bloodGroup) {
      case 'A+':
      case 'A-':
        return 'bg-red-100 text-red-800';
      case 'B+':
      case 'B-':
        return 'bg-blue-100 text-blue-800';
      case 'AB+':
      case 'AB-':
        return 'bg-purple-100 text-purple-800';
      case 'O+':
      case 'O-':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (patientsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading patients</h3>
            <div className="mt-2 text-sm text-red-700">{patientsError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all patients in the system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Patients
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
              Blood Group
            </label>
            <select
              id="bloodGroup"
              value={bloodGroupFilter}
              onChange={(e) => handleBloodGroupFilter(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients table */}
      <div className="bg-white shadow rounded-lg">
        {patientsLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emergency Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered Date
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.bloodGroup ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBloodGroupColor(
                            patient.bloodGroup
                          )}`}
                        >
                          <HeartIcon className="h-3 w-3 mr-1" />
                          {patient.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.phone ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {patient.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.emergencyContact || 'Not provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        View History
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No patients match your current filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {patients.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {patients.length} patients
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={patientFilters.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(patientFilters.page + 1)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
