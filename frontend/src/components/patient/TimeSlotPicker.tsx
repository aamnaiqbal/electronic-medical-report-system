'use client';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

// Format time from 24h (09:00:00) to 12h (9:00 AM)
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

export default function TimeSlotPicker({ timeSlots, selectedTime, onSelectTime }: TimeSlotPickerProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time Slot</h3>
      {timeSlots.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No available time slots for the selected date.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelectTime(slot.time)}
              disabled={!slot.available}
              className={`
                px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${
                  selectedTime === slot.time
                    ? 'bg-green-600 text-white ring-2 ring-green-500 ring-offset-2'
                    : slot.available
                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-green-500'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {formatTime(slot.time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
