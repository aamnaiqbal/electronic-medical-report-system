'use client';

import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
}

export default function Calendar({
  selectedDate,
  onSelectDate,
  currentMonth: controlledMonth,
  onMonthChange,
}: CalendarProps) {
  const today = startOfToday();
  const [internalMonth, setInternalMonth] = controlledMonth
    ? [controlledMonth, onMonthChange || (() => {})]
    : [today, (date: Date) => date];

  const currentMonth = controlledMonth || internalMonth;

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysFromPrevMonth = startDayOfWeek;

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalMonth(newMonth);
    }
  };

  const handleDateClick = (date: Date) => {
    if (!isBefore(date, today)) {
      onSelectDate(date);
    }
  };

  return (
    <div className="card p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days from previous month */}
        {Array.from({ length: daysFromPrevMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Actual days */}
        {daysInMonth.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);
          const isPast = isBefore(date, today);

          return (
            <button
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              disabled={isPast}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${isSelected ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                ${isCurrentDay && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                ${!isSelected && !isCurrentDay && !isPast ? 'text-gray-700' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-blue-100 mr-1"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-green-600 mr-1"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
