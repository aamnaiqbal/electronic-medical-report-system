'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  fetchPatientAppointments,
  setAppointmentFilters,
} from '@/lib/redux/slices/patientSlice';
import Link from 'next/link';
import { format } from 'date-fns';

export default function Appointments() {
  const dispatch = useAppDispatch();
  const { appointments, appointmentsLoading, appointmentsPagination } = useAppSelector((state) => state.patient);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [allAppointments, setAllAppointments] = useState<typeof appointments>([]);

  useEffect(() => {
    // Fetch all appointments initially
    dispatch(fetchPatientAppointments({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Store all appointments when they're loaded
  useEffect(() => {
    if (appointments.length > 0 && activeTab === 'all') {
      setAllAppointments(appointments);
    }
  }, [appointments, activeTab]);

  // Calculate counts from all appointments
  const counts = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const appointmentsList = allAppointments.length > 0 ? allAppointments : appointments;
    
    return {
      all: appointmentsList.length,
      upcoming: appointmentsList.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return (apt.status === 'confirmed' || apt.status === 'pending') && aptDate >= now;
      }).length,
      past: appointmentsList.filter(apt => apt.status === 'completed').length,
      cancelled: appointmentsList.filter(apt => apt.status === 'cancelled').length,
    };
  }, [allAppointments, appointments]);

  // Filter displayed appointments based on active tab
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    switch (activeTab) {
      case 'upcoming':
        return appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return (apt.status === 'confirmed' || apt.status === 'pending') && aptDate >= now;
        });
      case 'past':
        return appointments.filter(apt => apt.status === 'completed');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled');
      default:
        return appointments;
    }
  }, [appointments, activeTab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    
    // Fetch all appointments for 'all' tab, or fetch filtered for other tabs
    if (tab === 'all') {
      dispatch(fetchPatientAppointments({ page: 1, limit: 100 }));
    } else {
      // Let frontend filtering handle it
      // The counts are still calculated from all appointments
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const tabs = [
    { id: 'all', name: 'All Appointments', count: counts.all },
    { id: 'upcoming', name: 'Upcoming', count: counts.upcoming },
    { id: 'past', name: 'Past', count: counts.past },
    { id: 'cancelled', name: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-2 text-sm text-gray-600">View and manage your appointments</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Appointments List */}
      {appointmentsLoading ? (
        <div className="text-center py-12 text-gray-600">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'all' 
              ? 'Get started by booking a new appointment.' 
              : `No ${activeTab} appointments found.`}
          </p>
          {activeTab === 'all' && (
            <div className="mt-6">
              <Link href="/patient/book-appointment" className="btn-primary inline-block">
                Book Appointment
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/patient/appointments/${appointment.id}`}
              className="card p-6 hover:shadow-lg transition-shadow block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {appointment.doctorName}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{appointment.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                  <p className="text-sm text-gray-500">{formatTime(appointment.appointmentTime)}</p>
                </div>
              </div>

              {appointment.reason && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {appointmentsPagination && appointmentsPagination.total > appointments.length && (
        <div className="mt-6 flex justify-center">
          <button className="btn-secondary">Load More</button>
        </div>
      )}
    </div>
  );
}
