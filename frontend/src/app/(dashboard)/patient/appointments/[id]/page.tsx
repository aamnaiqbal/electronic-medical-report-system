'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchAppointmentById } from '@/lib/redux/slices/patientSlice';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function AppointmentDetail() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentAppointment, currentAppointmentLoading } = useAppSelector((state) => state.patient);

  const appointmentId = Number(params.id);

  useEffect(() => {
    if (appointmentId) {
      dispatch(fetchAppointmentById(appointmentId));
    }
  }, [dispatch, appointmentId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (currentAppointmentLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentAppointment) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Appointment not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
            <p className="mt-2 text-sm text-gray-600">
              Appointment #{currentAppointment.id}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
              currentAppointment.status
            )}`}
          >
            {currentAppointment.status}
          </span>
        </div>

        {/* Doctor Information */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Dr. {currentAppointment.doctorName}
                </p>
                <p className="text-sm text-gray-600">{currentAppointment.specialization}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">{currentAppointment.appointmentDate}</p>
              </div>
            </div>
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-600">{currentAppointment.appointmentTime}</p>
              </div>
            </div>
            {currentAppointment.reason && (
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Reason for Visit</p>
                  <p className="text-sm text-gray-600">{currentAppointment.reason}</p>
                </div>
              </div>
            )}
            {currentAppointment.notes && (
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Additional Notes</p>
                  <p className="text-sm text-gray-600">{currentAppointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring your ID and any relevant medical documents</li>
            <li>If you need to cancel, please do so at least 24 hours in advance</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/patient/appointments')}
            className="btn-primary w-full"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    </div>
  );
}
