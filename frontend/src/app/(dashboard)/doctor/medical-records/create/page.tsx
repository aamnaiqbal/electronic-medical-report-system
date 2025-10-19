'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { createMedicalRecord, fetchDoctorAppointments } from '@/lib/redux/slices/doctorSlice';
import { addToast } from '@/lib/redux/slices/uiSlice';
import MedicalRecordForm from '@/components/doctor/MedicalRecordForm';
import { Prescription } from '@/lib/redux/slices/doctorSlice';

export default function CreateMedicalRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { appointments, medicalRecordsLoading } = useAppSelector((state) => state.doctor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch completed appointments for the dropdown
    dispatch(fetchDoctorAppointments({ status: 'completed', limit: 100 }));
  }, [dispatch]);

  const handleSubmit = async (data: {
    appointmentId: number;
    diagnosis: string;
    symptoms?: string;
    prescriptions: Prescription[];
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await dispatch(createMedicalRecord(data)).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Success',
        message: 'Medical record created successfully',
      }));
      router.push('/doctor/appointments');
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: error as string || 'Failed to create medical record',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter completed appointments and format for the form
  const completedAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .map(apt => ({
      id: apt.id,
      patientName: apt.patientName,
      appointmentDate: apt.appointmentDate,
    }));

  // Pre-select appointment if coming from appointment detail page
  const preselectedAppointmentId = searchParams?.get('appointmentId');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Medical Record</h1>
        <p className="mt-2 text-gray-600">Document diagnosis and prescriptions for the patient</p>
      </div>

      {/* Form */}
      <div className="card p-6">
        {completedAppointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No completed appointments found</p>
            <p className="text-sm text-gray-400 mt-2">
              Medical records can only be created for completed appointments
            </p>
            <button
              onClick={() => router.push('/doctor/appointments')}
              className="btn-primary mt-4"
            >
              View Appointments
            </button>
          </div>
        ) : (
          <MedicalRecordForm
            appointments={completedAppointments}
            onSubmit={handleSubmit}
            isLoading={isSubmitting || medicalRecordsLoading}
          />
        )}
      </div>
    </div>
  );
}
