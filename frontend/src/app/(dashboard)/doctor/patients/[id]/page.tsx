'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchPatientById, fetchPatientMedicalRecords } from '@/lib/redux/slices/doctorSlice';
import {
  UserCircleIcon,
  CalendarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { 
    currentPatient, 
    currentPatientLoading,
    medicalRecords,
    medicalRecordsLoading 
  } = useAppSelector((state) => state.doctor);

  useEffect(() => {
    if (params.id) {
      const patientId = Number(params.id);
      dispatch(fetchPatientById(patientId));
      dispatch(fetchPatientMedicalRecords(patientId));
    }
  }, [dispatch, params.id]);

  if (currentPatientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          ← Back to Patients
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Patient Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <UserCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="text-base font-medium text-gray-900">
                  {currentPatient.firstName} {currentPatient.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-base font-medium text-gray-900">{currentPatient.email}</p>
              </div>
              {currentPatient.phone && (
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="text-base font-medium text-gray-900">{currentPatient.phone}</p>
                </div>
              )}
              {currentPatient.gender && (
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="text-base font-medium text-gray-900">
                    {currentPatient.gender.charAt(0).toUpperCase() + currentPatient.gender.slice(1)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HeartIcon className="h-6 w-6 mr-2 text-red-600" />
              Medical Information
            </h2>
            <div className="space-y-4">
              {currentPatient.bloodGroup && (
                <div>
                  <label className="text-sm text-gray-500">Blood Group</label>
                  <p className="text-base font-medium text-gray-900">{currentPatient.bloodGroup}</p>
                </div>
              )}
              {currentPatient.allergies && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-yellow-600" />
                    Allergies
                  </label>
                  <p className="text-base font-medium text-gray-900">{currentPatient.allergies}</p>
                </div>
              )}
              {currentPatient.emergencyContact && (
                <div>
                  <label className="text-sm text-gray-500">Emergency Contact</label>
                  <p className="text-base font-medium text-gray-900">{currentPatient.emergencyContact}</p>
                </div>
              )}
              {!currentPatient.bloodGroup && !currentPatient.allergies && !currentPatient.emergencyContact && (
                <p className="text-sm text-gray-500">No medical information available</p>
              )}
            </div>
          </div>

          {/* Medical History Timeline */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
              Medical History
            </h2>
            
            {medicalRecordsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Loading medical records...</p>
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No medical records found</p>
                <p className="text-sm mt-2">Create a medical record to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map((record: any) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {record.doctor_first_name && (
                          <p className="text-xs text-gray-400">
                            Dr. {record.doctor_first_name} {record.doctor_last_name} ({record.specialization})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Diagnosis</h3>
                      <p className="text-sm text-gray-900">{record.diagnosis}</p>
                    </div>

                    {record.symptoms && (
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Symptoms</h3>
                        <p className="text-sm text-gray-900">{record.symptoms}</p>
                      </div>
                    )}

                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Prescriptions</h3>
                        <div className="space-y-2">
                          {record.prescriptions.map((prescription: any, index: number) => (
                            <div key={index} className="bg-blue-50 rounded p-3">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-medium text-blue-900">
                                  {prescription.medication_name}
                                </p>
                                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                  {prescription.dosage}
                                </span>
                              </div>
                              <p className="text-xs text-blue-700">
                                {prescription.frequency} for {prescription.duration}
                              </p>
                              {prescription.instructions && (
                                <p className="text-xs text-blue-600 mt-1 italic">
                                  {prescription.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/doctor/medical-records/create?patientId=${currentPatient.id}`)}
                className="btn-primary w-full"
              >
                Create Medical Record
              </button>
              {/* <button className="btn-secondary w-full">View Appointments</button> */}
            </div>
          </div>

          {/* Patient Stats */}
          {/* <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Visits</span>
                <span className="text-sm font-medium text-gray-900">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Visit</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentPatient.lastVisit
                    ? new Date(currentPatient.lastVisit).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Patient Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(currentPatient.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
