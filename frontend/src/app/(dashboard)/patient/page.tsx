'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchPatientProfile, fetchPatientStats, fetchPatientAppointments } from '@/lib/redux/slices/patientSlice';
import {
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const dispatch = useAppDispatch();
  const { stats, appointments, profileLoading, appointmentsLoading } = useAppSelector((state) => state.patient);

  useEffect(() => {
    dispatch(fetchPatientProfile());
    dispatch(fetchPatientStats());
    dispatch(fetchPatientAppointments({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Filter upcoming appointments (exclude cancelled)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => {
        // Exclude cancelled appointments
        if (apt.status.toLowerCase() === 'cancelled') return false;
        
        // Check if appointment is in the future
        const appointmentDate = new Date(apt.appointmentDate);
        return appointmentDate >= now;
      })
      .slice(0, 5); // Show only 5 most recent
  }, [appointments]);

  const statCards = [
    {
      name: 'Upcoming Appointments',
      value: stats?.upcomingAppointments || 0,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Appointments',
      value: stats?.totalAppointments || 0,
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Medical Records',
      value: stats?.medicalRecords || 0,
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Completed Appointments',
      value: stats?.completedAppointments || 0,
      icon: UserGroupIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
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
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // timeString is in HH:MM:SS format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Welcome back! Here&apos;s your health overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/patient/book-appointment"
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule a visit with a doctor</p>
              </div>
            </div>
          </Link>

          <Link
            href="/patient/appointments"
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">View Appointments</h3>
                <p className="text-sm text-gray-600">Manage your appointments</p>
              </div>
            </div>
          </Link>

          <Link
            href="/patient/medical-history"
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
                <p className="text-sm text-gray-600">View your medical records</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
          <Link href="/patient/appointments" className="text-sm text-green-600 hover:text-green-700">
            View all
          </Link>
        </div>

        {appointmentsLoading ? (
          <div className="text-center py-8 text-gray-600">Loading appointments...</div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">No upcoming appointments</p>
            <Link href="/patient/book-appointment" className="btn-primary mt-4 inline-block">
              Book Appointment
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {appointment.doctorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(appointment.appointmentDate)}</div>
                      <div className="text-sm text-gray-500">{formatTime(appointment.appointmentTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.specialization || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
