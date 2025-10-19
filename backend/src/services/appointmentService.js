const { checkDoctorAvailability, getAvailableTimeSlots } = require('../models/appointmentModel');
const { getDoctorById } = require('../models/doctorModel');

/**
 * Appointment Service
 * Business logic for appointment management
 */

/**
 * Check if a time slot is available for booking
 * @param {number} doctorId - Doctor ID
 * @param {string} date - Appointment date (YYYY-MM-DD)
 * @param {string} time - Appointment time (HH:MM:SS)
 * @returns {Promise<Object>} Availability check result
 */
const checkSlotAvailability = async (doctorId, date, time) => {
    try {
        // Check if doctor exists
        const doctor = await getDoctorById(doctorId);
        if (!doctor) {
            return {
                available: false,
                reason: 'Doctor not found'
            };
        }
        
        // Check if date is in the future
        // Parse date string manually to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        const appointmentDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (appointmentDate < today) {
            return {
                available: false,
                reason: 'Appointment date must be in the future'
            };
        }
        
        // Check if date is not too far in the future (e.g., within 3 months)
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        
        if (appointmentDate > maxDate) {
            return {
                available: false,
                reason: 'Appointment date cannot be more than 3 months in the future'
            };
        }
        
        // Check if it's a valid day of the week (Monday to Friday)
        const dayOfWeek = appointmentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return {
                available: false,
                reason: 'Appointments are only available on weekdays (Monday to Friday)'
            };
        }
        
        // Check if time is within working hours (9 AM to 5 PM)
        const timeParts = time.split(':');
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        
        if (hour < 9 || hour > 17 || (hour === 17 && minute > 0)) {
            return {
                available: false,
                reason: 'Appointments are only available between 9:00 AM and 5:00 PM'
            };
        }
        
        // Check if time slot is available
        const isAvailable = await checkDoctorAvailability(doctorId, date, time);
        
        if (!isAvailable) {
            return {
                available: false,
                reason: 'Time slot is already booked'
            };
        }
        
        return {
            available: true,
            reason: 'Time slot is available'
        };
        
    } catch (error) {
        console.error('Check slot availability error:', error);
        return {
            available: false,
            reason: 'Error checking availability'
        };
    }
};

/**
 * Calculate available time slots for a doctor on a specific date
 * @param {number} doctorId - Doctor ID
 * @param {string} date - Appointment date (YYYY-MM-DD)
 * @returns {Promise<Object>} Available time slots
 */
const calculateAvailableSlots = async (doctorId, date) => {
    try {
        // Check if doctor exists
        const doctor = await getDoctorById(doctorId);
        if (!doctor) {
            return {
                available: false,
                slots: [],
                reason: 'Doctor not found'
            };
        }
        
        // Check if date is in the future
        // Parse date string manually to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        const appointmentDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (appointmentDate < today) {
            return {
                available: false,
                slots: [],
                reason: 'Date must be in the future'
            };
        }
        
        // Check if it's a valid day of the week
        const dayOfWeek = appointmentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return {
                available: false,
                slots: [],
                reason: 'Appointments are only available on weekdays'
            };
        }
        
        // Get available time slots
        const availableSlots = await getAvailableTimeSlots(doctorId, date);
        
        return {
            available: true,
            slots: availableSlots,
            date: date,
            doctor: {
                id: doctor.id,
                name: `${doctor.doctor_first_name} ${doctor.doctor_last_name}`,
                specialization: doctor.specialization,
                consultationFee: doctor.consultation_fee
            }
        };
        
    } catch (error) {
        console.error('Calculate available slots error:', error);
        return {
            available: false,
            slots: [],
            reason: 'Error calculating available slots'
        };
    }
};

/**
 * Send appointment confirmation (placeholder for email/notification service)
 * @param {Object} appointment - Appointment details
 * @param {Object} patient - Patient details
 * @param {Object} doctor - Doctor details
 * @returns {Promise<boolean>} Success status
 */
const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
    try {
        // This is a placeholder for email/notification service
        // In a real implementation, you would:
        // 1. Send email to patient
        // 2. Send notification to doctor
        // 3. Send SMS if configured
        // 4. Add to calendar
        
        console.log('Appointment confirmation would be sent:', {
            appointmentId: appointment.id,
            patientEmail: patient.patient_email,
            doctorEmail: doctor.doctor_email,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time
        });
        
        // For now, just return true
        return true;
        
    } catch (error) {
        console.error('Send appointment confirmation error:', error);
        return false;
    }
};

/**
 * Send appointment cancellation notification
 * @param {Object} appointment - Appointment details
 * @param {Object} patient - Patient details
 * @param {Object} doctor - Doctor details
 * @param {string} reason - Cancellation reason
 * @returns {Promise<boolean>} Success status
 */
const sendAppointmentCancellation = async (appointment, patient, doctor, reason) => {
    try {
        // This is a placeholder for email/notification service
        console.log('Appointment cancellation would be sent:', {
            appointmentId: appointment.id,
            patientEmail: patient.patient_email,
            doctorEmail: doctor.doctor_email,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
            reason: reason
        });
        
        return true;
        
    } catch (error) {
        console.error('Send appointment cancellation error:', error);
        return false;
    }
};

/**
 * Validate appointment time slot
 * @param {string} time - Time in HH:MM:SS format
 * @returns {Object} Validation result
 */
const validateTimeSlot = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    
    if (!timeRegex.test(time)) {
        return {
            valid: false,
            reason: 'Invalid time format. Use HH:MM:SS'
        };
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    // Check if time is within working hours (9 AM to 5 PM)
    if (hours < 9 || hours > 17 || (hours === 17 && minutes > 0)) {
        return {
            valid: false,
            reason: 'Appointments are only available between 9:00 AM and 5:00 PM'
        };
    }
    
    // Check if time is on the hour or half hour
    if (minutes !== 0 && minutes !== 30) {
        return {
            valid: false,
            reason: 'Appointments are only available on the hour or half hour'
        };
    }
    
    return {
        valid: true,
        reason: 'Time slot is valid'
    };
};

/**
 * Get working hours for a doctor
 * @returns {Array} Array of time slots
 */
const getWorkingHours = () => {
    return [
        '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
        '12:00:00', '12:30:00', '13:00:00', '13:30:00', '14:00:00', '14:30:00',
        '15:00:00', '15:30:00', '16:00:00', '16:30:00', '17:00:00'
    ];
};

/**
 * Check if appointment can be cancelled
 * @param {Object} appointment - Appointment details
 * @returns {Object} Cancellation check result
 */
const canCancelAppointment = (appointment) => {
    // Only pending appointments can be cancelled
    if (appointment.status !== 'pending') {
        return {
            canCancel: false,
            reason: 'Only pending appointments can be cancelled'
        };
    }
    
    // Check if appointment is in the future
    const appointmentDate = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
    const now = new Date();
    
    if (appointmentDate <= now) {
        return {
            canCancel: false,
            reason: 'Cannot cancel appointments that have already passed'
        };
    }
    
    // Check if appointment is not too close (e.g., within 2 hours)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    if (appointmentDate <= twoHoursFromNow) {
        return {
            canCancel: false,
            reason: 'Cannot cancel appointments within 2 hours of the scheduled time'
        };
    }
    
    return {
        canCancel: true,
        reason: 'Appointment can be cancelled'
    };
};

module.exports = {
    checkSlotAvailability,
    calculateAvailableSlots,
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
    validateTimeSlot,
    getWorkingHours,
    canCancelAppointment
};
