'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { fetchDashboardStats } from '@/lib/redux/slices/adminSlice';
import StatCard from '@/components/admin/StatCard';
import {
  UsersIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, statsLoading, statsError } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (statsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">{statsError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your healthcare management system
        </p>
      </div>

      {/* Getting Started Message - Show if no users */}
      {!statsLoading && stats && stats.totalUsers <= 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-blue-900">
                Welcome to Healthcare Admin Panel!
              </h3>
              <div className="mt-2 text-sm text-blue-800">
                <p className="mb-2">Get started by creating users for your system:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click on <strong>"Users"</strong> in the sidebar</li>
                  <li>Click the <strong>"Create New User"</strong> button</li>
                  <li>Fill in the user details and select their role (Doctor or Patient)</li>
                  <li>Complete the registration form</li>
                </ol>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.href = '/admin/users/create'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Your First User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<UsersIcon />}
          loading={statsLoading}
        />
        <StatCard
          title="Total Doctors"
          value={stats?.totalDoctors || 0}
          icon={<UserGroupIcon />}
          loading={statsLoading}
        />
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={<UserIcon />}
          loading={statsLoading}
        />
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={<CalendarIcon />}
          loading={statsLoading}
        />
      </div>

      {/* Appointment statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          icon={<ClockIcon />}
          loading={statsLoading}
          className="bg-blue-50"
        />
        <StatCard
          title="This Week"
          value={stats?.weekAppointments || 0}
          icon={<ChartBarIcon />}
          loading={statsLoading}
          className="bg-green-50"
        />
        <StatCard
          title="This Month"
          value={stats?.monthAppointments || 0}
          icon={<CalendarIcon />}
          loading={statsLoading}
          className="bg-purple-50"
        />
      </div>

      {/* Recent appointments */}
      {/* <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Appointments</h3>
          
          {statsLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.doctorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                        {appointment.appointmentTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : appointment.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent appointments</h3>
              <p className="mt-1 text-sm text-gray-500">
                No appointments have been scheduled recently.
              </p>
            </div>
          )}
        </div>
      </div> */}

      {/* Quick actions */}
      {/* <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UsersIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Manage Users</div>
              <div className="text-xs text-gray-500">View and manage all users</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Manage Doctors</div>
              <div className="text-xs text-gray-500">View and manage doctors</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UserIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Manage Patients</div>
              <div className="text-xs text-gray-500">View and manage patients</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CalendarIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Manage Appointments</div>
              <div className="text-xs text-gray-500">View and manage appointments</div>
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}
