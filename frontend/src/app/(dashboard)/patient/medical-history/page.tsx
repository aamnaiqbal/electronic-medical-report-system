'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchMedicalRecords } from '@/lib/redux/slices/patientSlice';
import MedicalRecordCard from '@/components/patient/MedicalRecordCard';
import AppointmentTimeline from '@/components/patient/AppointmentTimeline';
import Link from 'next/link';
import { useState } from 'react';

export default function MedicalHistory() {
  const dispatch = useAppDispatch();
  const { medicalRecords, medicalRecordsLoading } = useAppSelector((state) => state.patient);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  useEffect(() => {
    dispatch(fetchMedicalRecords());
  }, [dispatch]);

  const timelineItems = medicalRecords.map((record) => ({
    id: record.id,
    date: record.createdAt,
    doctorName: record.doctorName,
    specialization: record.specialization || 'N/A',
    diagnosis: record.diagnosis,
    type: 'medical-record' as const,
  }));

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical History</h1>
          <p className="mt-2 text-sm text-gray-600">View your medical records and history</p>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 text-sm font-medium border-l ${
              viewMode === 'timeline'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Timeline View
          </button>
        </div>
      </div>

      {medicalRecordsLoading ? (
        <div className="text-center py-12 text-gray-600">Loading medical records...</div>
      ) : medicalRecords.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your medical history will appear here after your appointments.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medicalRecords.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={{
                ...record,
                symptoms: record.symptoms || '',
                visitDate: record.createdAt,
                specialization: record.specialization || 'N/A',
                appointmentDate: record.appointmentDate,
                appointmentTime: record.appointmentTime,
                prescriptions: record.prescriptions?.map(p => ({
                  medication: p.medicationName,
                  dosage: p.dosage,
                  frequency: p.frequency,
                  duration: p.duration,
                })),
              }}
              onClick={() => (window.location.href = `/patient/medical-history/${record.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-3xl">
          <AppointmentTimeline items={timelineItems} />
        </div>
      )}

      {/* Pagination - removed for now */}
    </div>
  );
}
