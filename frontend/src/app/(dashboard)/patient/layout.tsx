'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PatientSidebar from '@/components/Layout/PatientSidebar';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'patient') {
        // Redirect based on actual role
        if (user?.role === 'admin') {
          router.push('/admin');
        } else if (user?.role === 'doctor') {
          router.push('/doctor');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'patient') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <PatientSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
}
