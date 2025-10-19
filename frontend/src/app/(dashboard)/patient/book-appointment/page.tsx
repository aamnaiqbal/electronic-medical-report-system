'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  fetchAvailableDoctors,
  fetchDoctorAvailability,
  bookAppointment,
  setBookingStep,
  setSelectedDoctor,
  setSelectedDate,
  setSelectedTime,
  setBookingReason,
  setBookingNotes,
  resetBooking,
  clearErrors,
} from '@/lib/redux/slices/patientSlice';
import DoctorCard from '@/components/patient/DoctorCard';
import Calendar from '@/components/patient/Calendar';
import TimeSlotPicker from '@/components/patient/TimeSlotPicker';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function BookAppointment() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    doctors,
    availableSlots,
    bookingStep,
    selectedDoctor,
    selectedDate,
    selectedTime,
    bookingReason,
    bookingNotes,
    doctorsLoading,
    slotsLoading,
    bookingLoading,
    bookingError,
  } = useAppSelector((state) => state.patient);

  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAvailableDoctors({ page: 1, limit: 50 }));
    return () => {
      dispatch(resetBooking());
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      dispatch(
        fetchDoctorAvailability({
          doctorId: selectedDoctor.id,
          date: selectedDate,
        })
      );
    }
  }, [dispatch, selectedDoctor, selectedDate]);

  const filteredDoctors = doctors.filter((doctor) => {
    const doctorName = `${doctor.firstName} ${doctor.lastName}`;
    const matchesSearch =
      searchQuery === '' ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialization =
      specializationFilter === '' || doctor.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  const specializations = Array.from(
    new Set(doctors.map((d) => d.specialization))
  );

  const handleDoctorSelect = (doctor: typeof doctors[0]) => {
    dispatch(setSelectedDoctor(doctor));
    dispatch(setBookingStep(2));
  };

  const handleDateSelect = (date: Date) => {
    // Use format with local timezone to avoid date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    dispatch(setSelectedDate(formattedDate));
  };

  const handleTimeSelect = (time: string) => {
    dispatch(setSelectedTime(time));
  };

  const handleNext = () => {
    if (bookingStep === 2 && selectedDate && selectedTime) {
      dispatch(setBookingStep(3));
    } else if (bookingStep === 3 && bookingReason) {
      dispatch(setBookingStep(4));
    }
  };

  const handleBack = () => {
    if (bookingStep > 1) {
      dispatch(setBookingStep(bookingStep - 1));
    }
  };

  const handleSubmit = async () => {
    if (selectedDoctor && selectedDate && selectedTime && bookingReason) {
      const result = await dispatch(
        bookAppointment({
          doctorId: selectedDoctor.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          reason: bookingReason,
          notes: bookingNotes,
        })
      );

      if (bookAppointment.fulfilled.match(result)) {
        router.push('/patient/appointments');
      }
    }
  };

  const isNextDisabled = () => {
    if (bookingStep === 2) return !selectedDate || !selectedTime;
    if (bookingStep === 3) return !bookingReason;
    return false;
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Schedule a visit with your preferred doctor
          </p>
        </div>

        {/* Error Message */}
        {bookingError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  Unable to Book Appointment
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {bookingError}
                </div>
              </div>
              <button
                onClick={() => dispatch(clearErrors())}
                className="ml-3 flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, name: 'Select Doctor' },
              { step: 2, name: 'Date & Time' },
              { step: 3, name: 'Details' },
              { step: 4, name: 'Confirm' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      ${
                        bookingStep >= item.step
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {bookingStep > item.step ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      item.step
                    )}
                  </div>
                  <p
                    className={`
                      mt-2 text-xs font-medium
                      ${bookingStep >= item.step ? 'text-gray-900' : 'text-gray-500'}
                    `}
                  >
                    {item.name}
                  </p>
                </div>
                {index < 3 && (
                  <div
                    className={`
                      flex-1 h-0.5 -mt-8
                      ${bookingStep > item.step ? 'bg-green-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step 1: Select Doctor */}
          {bookingStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Select a Doctor
              </h2>

              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctors Grid */}
              {doctorsLoading ? (
                <div className="text-center py-12 text-gray-600">Loading doctors...</div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12 text-gray-600">No doctors found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      isSelected={selectedDoctor?.id === doctor.id}
                      onSelect={handleDoctorSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {bookingStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Select Date & Time
              </h2>

              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Selected Doctor:</span> Dr.{' '}
                  {selectedDoctor?.firstName} {selectedDoctor?.lastName} ({selectedDoctor?.specialization})
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <Calendar
                    selectedDate={selectedDate ? (() => {
                      const [year, month, day] = selectedDate.split('-').map(Number);
                      return new Date(year, month - 1, day);
                    })() : null}
                    onSelectDate={handleDateSelect}
                  />
                </div>

                {/* Time Slots */}
                <div>
                  {selectedDate ? (
                    slotsLoading ? (
                      <div className="text-center py-12 text-gray-600">
                        Loading available time slots...
                      </div>
                    ) : (
                      <TimeSlotPicker
                        timeSlots={availableSlots}
                        selectedTime={selectedTime}
                        onSelectTime={handleTimeSelect}
                      />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Please select a date first
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Enter Details */}
          {bookingStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Appointment Details
              </h2>

              <div className="mb-6 p-4 bg-green-50 rounded-lg space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Doctor:</span> Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Date:</span>{' '}
                  {selectedDate && format(new Date(selectedDate), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Time:</span> {selectedTime}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookingReason}
                    onChange={(e) => dispatch(setBookingReason(e.target.value))}
                    placeholder="e.g., Regular checkup, Follow-up, Health concern"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => dispatch(setBookingNotes(e.target.value))}
                    placeholder="Any symptoms, medications, or other information the doctor should know..."
                    rows={4}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {bookingStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Confirm Appointment
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Doctor Information
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedDoctor?.specialization}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Appointment Details
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Date:</span>{' '}
                      {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Time:</span> {selectedTime}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Reason:</span> {bookingReason}
                    </p>
                    {bookingNotes && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {bookingNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Note:</span> Please arrive 10 minutes before
                      your scheduled time. You will receive a confirmation email shortly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={bookingStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {bookingStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={bookingLoading}
                className="btn-primary disabled:opacity-50"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
