import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getLocalStorageItem } from '@/lib/utils/localStorage';

// Types
export interface DoctorProfile {
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

export interface Patient {
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
  lastVisit?: string;
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
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
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

export interface DoctorStats {
  todayAppointments: number;
  upcomingAppointments: number;
  totalPatients: number;
  completedAppointments: number;
  todaySchedule: Appointment[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DoctorState {
  // Profile
  profile: DoctorProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // Stats
  stats: DoctorStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // Appointments
  appointments: Appointment[];
  appointmentsLoading: boolean;
  appointmentsError: string | null;
  appointmentsPagination: Pagination | null;

  // Single appointment
  currentAppointment: Appointment | null;
  currentAppointmentLoading: boolean;
  currentAppointmentError: string | null;

  // Patients
  patients: Patient[];
  patientsLoading: boolean;
  patientsError: string | null;
  patientsPagination: Pagination | null;

  // Single patient
  currentPatient: Patient | null;
  currentPatientLoading: boolean;
  currentPatientError: string | null;

  // Medical Records
  medicalRecords: MedicalRecord[];
  medicalRecordsLoading: boolean;
  medicalRecordsError: string | null;

  // Filters
  appointmentFilters: {
    search: string;
    status: string;
    dateFrom: string;
    dateTo: string;
    page: number;
    limit: number;
  };
  patientFilters: {
    search: string;
    page: number;
    limit: number;
  };
}

const initialState: DoctorState = {
  profile: null,
  profileLoading: false,
  profileError: null,

  stats: null,
  statsLoading: false,
  statsError: null,

  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
  appointmentsPagination: null,

  currentAppointment: null,
  currentAppointmentLoading: false,
  currentAppointmentError: null,

  patients: [],
  patientsLoading: false,
  patientsError: null,
  patientsPagination: null,

  currentPatient: null,
  currentPatientLoading: false,
  currentPatientError: null,

  medicalRecords: [],
  medicalRecordsLoading: false,
  medicalRecordsError: null,

  appointmentFilters: {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
  },
  patientFilters: {
    search: '',
    page: 1,
    limit: 10,
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Async Thunks
export const fetchDoctorProfile = createAsyncThunk(
  'doctor/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/profile`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      
      // Transform doctor data from snake_case to camelCase
      const doctor = data.data.doctor;
      const transformedDoctor = {
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
      };
      
      return transformedDoctor;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchDoctorStats = createAsyncThunk(
  'doctor/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/stats`, {
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

export const fetchDoctorAppointments = createAsyncThunk(
  'doctor/fetchAppointments',
  async (filters: Partial<DoctorState['appointmentFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/doctors/appointments?${params}`, {
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
        patientId: apt.patient_id,
        patientName: `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim(),
        patientEmail: apt.patient_email,
        patientPhone: apt.patient_phone,
        patientGender: apt.patient_gender,
        bloodGroup: apt.blood_group,
        allergies: apt.allergies,
        emergencyContact: apt.emergency_contact
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
  'doctor/fetchAppointmentById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/appointments/${id}`, {
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
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
        patientId: apt.patient_id,
        patientName: `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim(),
        patientEmail: apt.patient_email,
        patientPhone: apt.patient_phone,
        patientGender: apt.patient_gender,
        bloodGroup: apt.blood_group,
        allergies: apt.allergies,
        emergencyContact: apt.emergency_contact
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'doctor/updateAppointmentStatus',
  async ({ id, status, notes }: { id: number; status: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      const data = await response.json();
      const appointment = data.data.appointment;
      
      // Transform snake_case to camelCase
      return {
        id: appointment.id,
        doctorId: appointment.doctor_id,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
        patientId: appointment.patient_id,
        patientName: `${appointment.patient_first_name} ${appointment.patient_last_name}`.trim(),
        patientEmail: appointment.patient_email,
        patientPhone: appointment.patient_phone,
        patientGender: appointment.patient_gender,
        bloodGroup: appointment.blood_group,
        allergies: appointment.allergies,
        emergencyContact: appointment.emergency_contact
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchDoctorPatients = createAsyncThunk(
  'doctor/fetchPatients',
  async (filters: Partial<DoctorState['patientFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/doctors/patients?${params}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      
      // Transform snake_case to camelCase
      const transformedPatients = data.data.map((patient: any) => ({
        id: patient.patient_id,
        userId: patient.patient_user_id,
        bloodGroup: patient.blood_group,
        allergies: patient.allergies,
        emergencyContact: patient.emergency_contact,
        firstName: patient.patient_first_name,
        lastName: patient.patient_last_name,
        email: patient.patient_email,
        phone: patient.patient_phone,
        gender: patient.patient_gender,
        dateOfBirth: patient.patient_date_of_birth,
        address: patient.patient_address,
        lastVisit: patient.last_appointment_date,
        appointmentCount: patient.appointment_count,
        createdAt: patient.patient_created_at,
      }));
      
      return {
        data: transformedPatients,
        pagination: data.pagination,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'doctor/fetchPatientById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/patients/${id}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch patient');
      const data = await response.json();
      
      // Transform snake_case to camelCase
      const patient = data.data.patient;
      return {
        id: patient.patient_id,
        userId: patient.patient_user_id,
        bloodGroup: patient.blood_group,
        allergies: patient.allergies,
        emergencyContact: patient.emergency_contact,
        firstName: patient.patient_first_name,
        lastName: patient.patient_last_name,
        email: patient.patient_email,
        phone: patient.patient_phone,
        gender: patient.patient_gender,
        dateOfBirth: patient.patient_date_of_birth,
        address: patient.patient_address,
        lastVisit: patient.last_appointment_date,
        appointmentCount: patient.appointment_count,
        createdAt: patient.patient_created_at,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createMedicalRecord = createAsyncThunk(
  'doctor/createMedicalRecord',
  async (recordData: {
    appointmentId: number;
    diagnosis: string;
    symptoms?: string;
    prescriptions: Prescription[];
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) throw new Error('Failed to create medical record');
      const data = await response.json();
      return data.data.medicalRecord;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchPatientMedicalRecords = createAsyncThunk(
  'doctor/fetchPatientMedicalRecords',
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/patients/${patientId}/medical-records`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch medical records');
      const data = await response.json();
      return data.data.medicalRecords;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctor/updateProfile',
  async (profileData: Partial<DoctorProfile>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      
      // Transform doctor data from snake_case to camelCase
      const doctor = data.data.doctor;
      const transformedDoctor = {
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
      };
      
      return transformedDoctor;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setAppointmentFilters: (state, action: PayloadAction<Partial<DoctorState['appointmentFilters']>>) => {
      state.appointmentFilters = { ...state.appointmentFilters, ...action.payload };
    },
    setPatientFilters: (state, action: PayloadAction<Partial<DoctorState['patientFilters']>>) => {
      state.patientFilters = { ...state.patientFilters, ...action.payload };
    },
    clearErrors: (state) => {
      state.profileError = null;
      state.statsError = null;
      state.appointmentsError = null;
      state.currentAppointmentError = null;
      state.patientsError = null;
      state.currentPatientError = null;
      state.medicalRecordsError = null;
    },
  },
  extraReducers: (builder) => {
    // Profile
    builder
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchDoctorProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      });

    // Stats
    builder
      .addCase(fetchDoctorStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchDoctorStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDoctorStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      });

    // Appointments
    builder
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload.data;
        state.appointmentsPagination = action.payload.pagination;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
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

    // Update appointment status
    builder
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      });

    // Patients
    builder
      .addCase(fetchDoctorPatients.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
      })
      .addCase(fetchDoctorPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.patients = action.payload.data;
        state.patientsPagination = action.payload.pagination;
      })
      .addCase(fetchDoctorPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload as string;
      });

    // Single patient
    builder
      .addCase(fetchPatientById.pending, (state) => {
        state.currentPatientLoading = true;
        state.currentPatientError = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.currentPatientLoading = false;
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.currentPatientLoading = false;
        state.currentPatientError = action.payload as string;
      });

    // Medical records
    builder
      .addCase(createMedicalRecord.pending, (state) => {
        state.medicalRecordsLoading = true;
        state.medicalRecordsError = null;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.medicalRecordsLoading = false;
        state.medicalRecords.push(action.payload);
      })
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.medicalRecordsLoading = false;
        state.medicalRecordsError = action.payload as string;
      })
      .addCase(fetchPatientMedicalRecords.pending, (state) => {
        state.medicalRecordsLoading = true;
        state.medicalRecordsError = null;
      })
      .addCase(fetchPatientMedicalRecords.fulfilled, (state, action) => {
        state.medicalRecordsLoading = false;
        state.medicalRecords = action.payload;
      })
      .addCase(fetchPatientMedicalRecords.rejected, (state, action) => {
        state.medicalRecordsLoading = false;
        state.medicalRecordsError = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const {
  setAppointmentFilters,
  setPatientFilters,
  clearErrors,
} = doctorSlice.actions;

export default doctorSlice.reducer;
