import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getLocalStorageItem } from '@/lib/utils/localStorage';

// Types
export interface PatientProfile {
  id: number;
  userId: number;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  createdAt: string;
}

export interface Doctor {
  id: number;
  userId: number;
  specialization: string;
  licenseNumber: string;
  qualification?: string;
  experienceYears: number;
  consultationFee: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  doctorName: string;
  doctorEmail?: string;
  doctorPhone?: string;
  specialization: string;
  consultationFee?: string;
  licenseNumber?: string;
  qualification?: string;
  experienceYears?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  doctorId: number;
  patientId: number;
  diagnosis: string;
  symptoms?: string;
  prescriptions: Prescription[];
  notes?: string;
  doctorName: string;
  specialization?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  createdAt: string;
}

export interface Prescription {
  id?: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface PatientStats {
  upcomingAppointments: number;
  totalAppointments: number;
  completedAppointments: number;
  medicalRecords: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PatientState {
  // Profile
  profile: PatientProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // Stats
  stats: PatientStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // Doctors
  doctors: Doctor[];
  doctorsLoading: boolean;
  doctorsError: string | null;
  doctorsPagination: Pagination | null;

  // Appointments
  appointments: Appointment[];
  appointmentsLoading: boolean;
  appointmentsError: string | null;
  appointmentsPagination: Pagination | null;

  // Single appointment
  currentAppointment: Appointment | null;
  currentAppointmentLoading: boolean;
  currentAppointmentError: string | null;

  // Medical Records
  medicalRecords: MedicalRecord[];
  medicalRecordsLoading: boolean;
  medicalRecordsError: string | null;

  // Single medical record
  currentMedicalRecord: MedicalRecord | null;
  currentMedicalRecordLoading: boolean;
  currentMedicalRecordError: string | null;

  // Time slots
  availableSlots: TimeSlot[];
  slotsLoading: boolean;
  slotsError: string | null;

  // Booking state
  bookingStep: number;
  selectedDoctor: Doctor | null;
  selectedDate: string | null;
  selectedTime: string | null;
  bookingReason: string;
  bookingNotes: string;
  bookingLoading: boolean;
  bookingError: string | null;

  // Filters
  doctorFilters: {
    search: string;
    specialization: string;
    page: number;
    limit: number;
  };
  appointmentFilters: {
    status: string;
    dateFrom: string;
    dateTo: string;
    page: number;
    limit: number;
  };
}

const initialState: PatientState = {
  profile: null,
  profileLoading: false,
  profileError: null,

  stats: null,
  statsLoading: false,
  statsError: null,

  doctors: [],
  doctorsLoading: false,
  doctorsError: null,
  doctorsPagination: null,

  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
  appointmentsPagination: null,

  currentAppointment: null,
  currentAppointmentLoading: false,
  currentAppointmentError: null,

  medicalRecords: [],
  medicalRecordsLoading: false,
  medicalRecordsError: null,

  currentMedicalRecord: null,
  currentMedicalRecordLoading: false,
  currentMedicalRecordError: null,

  availableSlots: [],
  slotsLoading: false,
  slotsError: null,

  bookingStep: 1,
  selectedDoctor: null,
  selectedDate: null,
  selectedTime: null,
  bookingReason: '',
  bookingNotes: '',
  bookingLoading: false,
  bookingError: null,

  doctorFilters: {
    search: '',
    specialization: '',
    page: 1,
    limit: 12,
  },
  appointmentFilters: {
    status: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Async Thunks
export const fetchPatientProfile = createAsyncThunk(
  'patient/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/profile`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      
      // Transform snake_case to camelCase
      const patient = data.data.patient;
      const transformedPatient = {
        id: patient.id,
        userId: patient.user_id,
        bloodGroup: patient.blood_group,
        allergies: patient.allergies,
        emergencyContact: patient.emergency_contact,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        dateOfBirth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '', // Convert to YYYY-MM-DD format
        address: patient.address,
        createdAt: patient.created_at || patient.profile_created_at,
      };
      
      return transformedPatient;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchPatientStats = createAsyncThunk(
  'patient/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/stats`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchAvailableDoctors = createAsyncThunk(
  'patient/fetchAvailableDoctors',
  async (filters: Partial<PatientState['doctorFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/patients/doctors?${params}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      
      // Transform doctor data from snake_case to camelCase
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map((doctor: any) => ({
          id: doctor.id,
          userId: doctor.user_id,
          specialization: doctor.specialization,
          licenseNumber: doctor.license_number,
          qualification: doctor.qualification,
          experienceYears: doctor.experience_years,
          consultationFee: doctor.consultation_fee,
          firstName: doctor.first_name,
          lastName: doctor.last_name,
          email: doctor.email,
          phone: doctor.phone,
          gender: doctor.gender,
          createdAt: doctor.created_at || doctor.user_created_at,
        }));
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchDoctorAvailability = createAsyncThunk(
  'patient/fetchDoctorAvailability',
  async ({ doctorId, date }: { doctorId: number; date: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/doctors/${doctorId}/availability?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      
      // Transform array of time strings to TimeSlot objects
      const slots = data.data.slots || [];
      const timeSlots = slots.map((time: string) => ({
        time,
        available: true
      }));
      
      return timeSlots;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'patient/bookAppointment',
  async (appointmentData: {
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Format validation errors into a readable message
          const validationMessages = errorData.errors.map((err: any) => err.message).join(', ');
          return rejectWithValue(validationMessages);
        }
        
        // Handle general error message
        return rejectWithValue(errorData.message || 'Failed to book appointment');
      }
      const data = await response.json();
      return data.data.appointment;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchPatientAppointments = createAsyncThunk(
  'patient/fetchAppointments',
  async (filters: Partial<PatientState['appointmentFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/patients/appointments?${params}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      
      // Transform snake_case to camelCase
      const transformedAppointments = data.data.map((apt: any) => ({
        id: apt.id,
        doctorId: apt.doctor_id,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
        doctorName: `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim(),
        doctorEmail: apt.doctor_email,
        doctorPhone: apt.doctor_phone,
        specialization: apt.specialization,
        consultationFee: apt.consultation_fee,
        licenseNumber: apt.license_number,
        qualification: apt.qualification,
        experienceYears: apt.experience_years
      }));
      
      return {
        data: transformedAppointments,
        pagination: data.meta?.pagination || data.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'patient/fetchAppointmentById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/appointments/${id}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch appointment');
      const data = await response.json();
      const apt = data.data.appointment;
      
      // Transform snake_case to camelCase
      return {
        id: apt.id,
        doctorId: apt.doctor_id,
        patientId: apt.patient_id,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
        doctorName: `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim(),
        doctorEmail: apt.doctor_email,
        doctorPhone: apt.doctor_phone,
        specialization: apt.specialization,
        consultationFee: apt.consultation_fee,
        licenseNumber: apt.license_number,
        qualification: apt.qualification,
        experienceYears: apt.experience_years
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'patient/cancelAppointment',
  async ({ id, reason }: { id: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchMedicalRecords = createAsyncThunk(
  'patient/fetchMedicalRecords',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/medical-records`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch medical records');
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchMedicalRecordById = createAsyncThunk(
  'patient/fetchMedicalRecordById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/medical-records/${id}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch medical record');
      const data = await response.json();
      return data.data.medicalRecord;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updatePatientProfile = createAsyncThunk(
  'patient/updateProfile',
  async (profileData: Partial<PatientProfile>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/patients/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      
      // Transform snake_case to camelCase (same as fetchPatientProfile)
      const patient = data.data.patient;
      const transformedPatient = {
        id: patient.id,
        userId: patient.user_id,
        bloodGroup: patient.blood_group,
        allergies: patient.allergies,
        emergencyContact: patient.emergency_contact,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        dateOfBirth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '', // Convert to YYYY-MM-DD format
        address: patient.address,
        createdAt: patient.created_at || patient.profile_created_at,
      };
      
      return transformedPatient;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setDoctorFilters: (state, action: PayloadAction<Partial<PatientState['doctorFilters']>>) => {
      state.doctorFilters = { ...state.doctorFilters, ...action.payload };
    },
    setAppointmentFilters: (state, action: PayloadAction<Partial<PatientState['appointmentFilters']>>) => {
      state.appointmentFilters = { ...state.appointmentFilters, ...action.payload };
    },
    setBookingStep: (state, action: PayloadAction<number>) => {
      state.bookingStep = action.payload;
    },
    setSelectedDoctor: (state, action: PayloadAction<Doctor | null>) => {
      state.selectedDoctor = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action: PayloadAction<string | null>) => {
      state.selectedTime = action.payload;
    },
    setBookingReason: (state, action: PayloadAction<string>) => {
      state.bookingReason = action.payload;
    },
    setBookingNotes: (state, action: PayloadAction<string>) => {
      state.bookingNotes = action.payload;
    },
    resetBooking: (state) => {
      state.bookingStep = 1;
      state.selectedDoctor = null;
      state.selectedDate = null;
      state.selectedTime = null;
      state.bookingReason = '';
      state.bookingNotes = '';
      state.bookingError = null;
    },
    clearErrors: (state) => {
      state.profileError = null;
      state.statsError = null;
      state.doctorsError = null;
      state.appointmentsError = null;
      state.currentAppointmentError = null;
      state.medicalRecordsError = null;
      state.currentMedicalRecordError = null;
      state.slotsError = null;
      state.bookingError = null;
    },
  },
  extraReducers: (builder) => {
    // Profile
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      });

    // Stats
    builder
      .addCase(fetchPatientStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchPatientStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPatientStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      });

    // Doctors
    builder
      .addCase(fetchAvailableDoctors.pending, (state) => {
        state.doctorsLoading = true;
        state.doctorsError = null;
      })
      .addCase(fetchAvailableDoctors.fulfilled, (state, action) => {
        state.doctorsLoading = false;
        state.doctors = action.payload.data;
        state.doctorsPagination = action.payload.pagination;
      })
      .addCase(fetchAvailableDoctors.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.doctorsError = action.payload as string;
      });

    // Availability
    builder
      .addCase(fetchDoctorAvailability.pending, (state) => {
        state.slotsLoading = true;
        state.slotsError = null;
      })
      .addCase(fetchDoctorAvailability.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchDoctorAvailability.rejected, (state, action) => {
        state.slotsLoading = false;
        state.slotsError = action.payload as string;
      });

    // Book appointment
    builder
      .addCase(bookAppointment.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.appointments.unshift(action.payload);
        // Reset booking state
        state.bookingStep = 1;
        state.selectedDoctor = null;
        state.selectedDate = null;
        state.selectedTime = null;
        state.bookingReason = '';
        state.bookingNotes = '';
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload as string;
      });

    // Appointments
    builder
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload.data;
        state.appointmentsPagination = action.payload.pagination;
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload as string;
      });

    // Single appointment
    builder
      .addCase(fetchAppointmentById.pending, (state) => {
        state.currentAppointmentLoading = true;
        state.currentAppointmentError = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.currentAppointmentLoading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.currentAppointmentLoading = false;
        state.currentAppointmentError = action.payload as string;
      });

    // Cancel appointment
    builder
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(apt => apt.id === action.payload);
        if (index !== -1) {
          state.appointments[index].status = 'cancelled';
        }
        if (state.currentAppointment?.id === action.payload) {
          state.currentAppointment.status = 'cancelled';
        }
      });

    // Medical records
    builder
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.medicalRecordsLoading = true;
        state.medicalRecordsError = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.medicalRecordsLoading = false;
        state.medicalRecords = action.payload;
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.medicalRecordsLoading = false;
        state.medicalRecordsError = action.payload as string;
      });

    // Single medical record
    builder
      .addCase(fetchMedicalRecordById.pending, (state) => {
        state.currentMedicalRecordLoading = true;
        state.currentMedicalRecordError = null;
      })
      .addCase(fetchMedicalRecordById.fulfilled, (state, action) => {
        state.currentMedicalRecordLoading = false;
        state.currentMedicalRecord = action.payload;
      })
      .addCase(fetchMedicalRecordById.rejected, (state, action) => {
        state.currentMedicalRecordLoading = false;
        state.currentMedicalRecordError = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const {
  setDoctorFilters,
  setAppointmentFilters,
  setBookingStep,
  setSelectedDoctor,
  setSelectedDate,
  setSelectedTime,
  setBookingReason,
  setBookingNotes,
  resetBooking,
  clearErrors,
} = patientSlice.actions;

export default patientSlice.reducer;
