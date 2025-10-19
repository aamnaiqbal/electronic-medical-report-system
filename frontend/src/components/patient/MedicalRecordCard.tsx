'use client';

import { format } from 'date-fns';

interface MedicalRecord {
  id: number;
  doctorName: string;
  specialization: string;
  diagnosis: string;
  symptoms: string;
  visitDate: string;
  appointmentDate?: string;
  appointmentTime?: string;
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onClick?: () => void;
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

const formatTime = (timeString: string) => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
};

export default function MedicalRecordCard({ record, onClick }: MedicalRecordCardProps) {
  const displayDate = record.appointmentDate 
    ? formatDate(record.appointmentDate) 
    : formatDate(record.visitDate);
  
  const displayTime = record.appointmentTime 
    ? ` at ${formatTime(record.appointmentTime)}` 
    : '';

  return (
    <div
      onClick={onClick}
      className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Dr. {record.doctorName}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {record.specialization}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{displayDate}{displayTime}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Diagnosis</p>
          <p className="text-sm text-gray-900 mt-1">{record.diagnosis}</p>
        </div>

        {record.symptoms && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Symptoms</p>
            <p className="text-sm text-gray-900 mt-1">{record.symptoms}</p>
          </div>
        )}

        {record.prescriptions && record.prescriptions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prescriptions</p>
            <div className="mt-1 space-y-1">
              {record.prescriptions.slice(0, 2).map((prescription, index) => (
                <p key={index} className="text-sm text-gray-700">
                  • {prescription.medication} - {prescription.dosage}
                </p>
              ))}
              {record.prescriptions.length > 2 && (
                <p className="text-sm text-gray-500">
                  +{record.prescriptions.length - 2} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
          View Details →
        </button>
      </div>
    </div>
  );
}
