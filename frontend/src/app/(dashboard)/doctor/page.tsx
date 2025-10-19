'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchDoctorStats } from '@/lib/redux/slices/doctorSlice';
import { CalendarIcon, UserGroupIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import AppointmentCard from '@/components/doctor/AppointmentCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { stats, statsLoading, statsError } = useAppSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchDoctorStats());
  }, [dispatch]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading dashboard: {statsError}</p>
      </div>
    );
  }

  const statCards = [
    {
      name: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: ClockIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Upcoming Appointments',
      value: stats?.upcomingAppointments || 0,
      icon: CalendarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Completed Appointments',
      value: stats?.completedAppointments || 0,
      icon: CheckCircleIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here&apos;s your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
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
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/doctor/appointments"
          className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">View Calendar</h3>
              <p className="mt-1 text-sm text-gray-600">See all your appointments</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Link>

        <Link
          href="/doctor/medical-records/create"
          className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Add Medical Record</h3>
              <p className="mt-1 text-sm text-gray-600">Create new patient record</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </Link>
      </div> */}

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today&apos;s Schedule</h2>
          <Link href="/doctor/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </Link>
        </div>

        {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {stats.todaySchedule.slice(0, 4).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onViewDetails={() => router.push(`/doctor/appointments/${appointment.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments today</h3>
            <p className="mt-1 text-sm text-gray-500">You have no scheduled appointments for today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
