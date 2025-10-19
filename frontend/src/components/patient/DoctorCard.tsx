'use client';

import type { Doctor } from '@/lib/redux/slices/patientSlice';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected?: boolean;
  onSelect?: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, isSelected, onSelect }: DoctorCardProps) {
  const doctorName = `${doctor.firstName} ${doctor.lastName}`;
  
  return (
    <div
      onClick={() => onSelect?.(doctor)}
      className={`card p-6 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Dr. {doctorName}</h3>
          <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {doctor.experienceYears} years experience
        </div>
        {doctor.qualification && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            {doctor.qualification}
          </div>
        )}
      </div>
    </div>
  );
}
