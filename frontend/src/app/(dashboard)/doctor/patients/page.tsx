'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchDoctorPatients, setPatientFilters } from '@/lib/redux/slices/doctorSlice';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PatientCard from '@/components/doctor/PatientCard';

export default function PatientsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { patients, patientsLoading, patientFilters, patientsPagination } = useAppSelector(
    (state) => state.doctor
  );

  const [searchQuery, setSearchQuery] = useState(patientFilters.search);

  useEffect(() => {
    dispatch(fetchDoctorPatients(patientFilters));
  }, [dispatch, patientFilters]);

  const handleSearch = () => {
    dispatch(setPatientFilters({ ...patientFilters, search: searchQuery, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
        <p className="mt-2 text-gray-600">View and manage your patient list</p>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field pl-10"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                dispatch(setPatientFilters({ ...patientFilters, search: '', page: 1 }));
              }}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Patients Grid */}
      {patientsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading patients...</p>
          </div>
        </div>
      ) : patients.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No patients found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onViewDetails={() => router.push(`/doctor/patients/${patient.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {patientsPagination && patientsPagination.pages > 1 && (
            <div className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{patientFilters.page}</span> of{' '}
                  <span className="font-medium">{patientsPagination.pages}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch(setPatientFilters({ ...patientFilters, page: patientFilters.page - 1 }))}
                  disabled={patientFilters.page === 1}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <button
                  onClick={() => dispatch(setPatientFilters({ ...patientFilters, page: patientFilters.page + 1 }))}
                  disabled={patientFilters.page === patientsPagination.pages}
                  className="btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
