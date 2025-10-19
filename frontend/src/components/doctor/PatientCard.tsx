'use client';

import { Patient } from '@/lib/redux/slices/doctorSlice';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface PatientCardProps {
  patient: Patient;
  onViewDetails?: () => void;
}

export default function PatientCard({ patient, onViewDetails }: PatientCardProps) {
  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <UserCircleIcon className="h-16 w-16 text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {patient.firstName} {patient.lastName}
          </h3>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
            
            {patient.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{patient.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {patient.bloodGroup && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Blood: {patient.bloodGroup}
              </span>
            )}
            {patient.gender && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {patient.gender}
              </span>
            )}
          </div>

          {/* {patient.lastVisit && (
            <p className="mt-2 text-xs text-gray-500">
              Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
            </p>
          )} */}
        </div>
      </div>

      {onViewDetails && (
        <div className="mt-4">
          <button
            onClick={onViewDetails}
            className="btn-primary w-full text-sm"
          >
            View History
          </button>
        </div>
      )}
    </div>
  );
}
