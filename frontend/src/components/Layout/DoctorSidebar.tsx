'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/lib/redux/store';
import { logout } from '@/lib/redux/slices/authSlice';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/doctor', icon: HomeIcon },
  { name: 'Appointments', href: '/doctor/appointments', icon: CalendarIcon },
  { name: 'Patients', href: '/doctor/patients', icon: UserGroupIcon },
  { name: 'Medical Records', href: '/doctor/medical-records/create', icon: DocumentTextIcon },
  { name: 'Profile', href: '/doctor/profile', icon: UserCircleIcon },
];

export default function DoctorSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Doctor Portal</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-4 py-3 text-sm font-medium rounded-md
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-6 w-6 flex-shrink-0
                  ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
