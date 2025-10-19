'use client';

import { Appointment } from '@/lib/redux/slices/doctorSlice';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails?: () => void;
  onUpdateStatus?: (status: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AppointmentCard({ appointment, onViewDetails, onUpdateStatus }: AppointmentCardProps) {
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
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Date:</span> {formatDate(appointment.appointmentDate)}
            </p>
            <p>
              <span className="font-medium">Time:</span> {formatTime(appointment.appointmentTime)}
            </p>
            {appointment.reason && (
              <p>
                <span className="font-medium">Reason:</span> {appointment.reason}
              </p>
            )}
            {appointment.patientPhone && (
              <p>
                <span className="font-medium">Contact:</span> {appointment.patientPhone}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="btn-secondary text-sm"
          >
            View Details
          </button>
        )}
        
        {onUpdateStatus && appointment.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus('confirmed')}
            className="btn-primary text-sm"
          >
            Confirm
          </button>
        )}
        
        {onUpdateStatus && appointment.status === 'confirmed' && (
          <button
            onClick={() => onUpdateStatus('completed')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
