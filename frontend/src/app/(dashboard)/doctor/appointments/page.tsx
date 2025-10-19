'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchDoctorAppointments, setAppointmentFilters, updateAppointmentStatus } from '@/lib/redux/slices/doctorSlice';
import { addToast } from '@/lib/redux/slices/uiSlice';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { appointments, appointmentsLoading, appointmentFilters, appointmentsPagination } = useAppSelector(
    (state) => state.doctor
  );

  const [localFilters, setLocalFilters] = useState(appointmentFilters);

  useEffect(() => {
    dispatch(fetchDoctorAppointments(appointmentFilters));
  }, [dispatch, appointmentFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const applyFilters = () => {
    dispatch(setAppointmentFilters(localFilters));
  };

  const resetFilters = () => {
    const resetFilters = {
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 10,
    };
    setLocalFilters(resetFilters);
    dispatch(setAppointmentFilters(resetFilters));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const handleStatusUpdate = async (appointmentId: number, status: string) => {
    try {
      const result = await dispatch(updateAppointmentStatus({ 
        id: appointmentId, 
        status 
      }));
      
      if (updateAppointmentStatus.fulfilled.match(result)) {
        dispatch(addToast({
          type: 'success',
          title: 'Success',
          message: `Appointment ${status} successfully`,
          duration: 3000
        }));
        // Refresh appointments list
        dispatch(fetchDoctorAppointments(appointmentFilters));
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to update appointment status',
          duration: 3000
        }));
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'An error occurred while updating appointment',
        duration: 3000
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="mt-2 text-gray-600">Manage your patient appointments</p>
      </div>

      {/* Filters */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Patient name..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={localFilters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={localFilters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={applyFilters} className="btn-primary">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="btn-secondary">
            Reset
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointmentsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading appointments...</p>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(appointment.appointmentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(appointment.appointmentTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {appointment.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/doctor/appointments/${appointment.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              className="inline-flex items-center gap-1 text-green-600 hover:text-green-900"
                              title="Confirm Appointment"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-900"
                              title="Cancel Appointment"
                            >
                              <XCircleIcon className="h-4 w-4" />
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                            title="Mark as Completed"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {appointmentsPagination && appointmentsPagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => dispatch(setAppointmentFilters({ ...appointmentFilters, page: appointmentFilters.page - 1 }))}
                disabled={appointmentFilters.page === 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => dispatch(setAppointmentFilters({ ...appointmentFilters, page: appointmentFilters.page + 1 }))}
                disabled={appointmentFilters.page === appointmentsPagination.pages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{appointmentFilters.page}</span> of{' '}
                  <span className="font-medium">{appointmentsPagination.pages}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch(setAppointmentFilters({ ...appointmentFilters, page: appointmentFilters.page - 1 }))}
                  disabled={appointmentFilters.page === 1}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <button
                  onClick={() => dispatch(setAppointmentFilters({ ...appointmentFilters, page: appointmentFilters.page + 1 }))}
                  disabled={appointmentFilters.page === appointmentsPagination.pages}
                  className="btn-secondary"
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
