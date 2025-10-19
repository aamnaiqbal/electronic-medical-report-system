'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchAppointmentById, updateAppointmentStatus } from '@/lib/redux/slices/doctorSlice';
import { addToast } from '@/lib/redux/slices/uiSlice';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentAppointment, currentAppointmentLoading } = useAppSelector((state) => state.doctor);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchAppointmentById(Number(params.id)));
    }
  }, [dispatch, params.id]);

  const handleUpdateStatus = async (status: string) => {
    if (!currentAppointment) return;

    setIsUpdating(true);
    try {
      await dispatch(updateAppointmentStatus({ id: currentAppointment.id, status })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Appointment ${status} successfully`,
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Update Failed',
        message: error as string,
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  if (currentAppointmentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading appointment...</p>
        </div>
      </div>
    );
  }

  if (!currentAppointment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back to Appointments
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[currentAppointment.status]}`}>
          {currentAppointment.status.charAt(0).toUpperCase() + currentAppointment.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-base font-medium text-gray-900">{currentAppointment.patientName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-medium text-gray-900">{currentAppointment.patientEmail}</p>
                </div>
              </div>
              {currentAppointment.patientPhone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-base font-medium text-gray-900">{currentAppointment.patientPhone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
              Appointment Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(currentAppointment.appointmentDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatTime(currentAppointment.appointmentTime)}
                  </p>
                </div>
              </div>
              {currentAppointment.reason && (
                <div className="flex items-start">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Reason for Visit</p>
                    <p className="text-base font-medium text-gray-900">{currentAppointment.reason}</p>
                  </div>
                </div>
              )}
              {currentAppointment.notes && (
                <div className="flex items-start">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-base font-medium text-gray-900">{currentAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {currentAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('confirmed')}
                    disabled={isUpdating}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Confirm Appointment
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Cancel Appointment
                  </button>
                </>
              )}

              {currentAppointment.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Cancel Appointment
                  </button>
                </>
              )}

              {currentAppointment.status === 'completed' && (
                <button
                  onClick={() => router.push(`/doctor/medical-records/create?appointmentId=${currentAppointment.id}`)}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Create Medical Record
                </button>
              )}

              <button
                onClick={() => router.push(`/doctor/patients/${currentAppointment.patientId}`)}
                className="btn-secondary w-full"
              >
                View Patient History
              </button>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium text-gray-900">
                  {new Date(currentAppointment.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium text-gray-900">
                  {new Date(currentAppointment.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
