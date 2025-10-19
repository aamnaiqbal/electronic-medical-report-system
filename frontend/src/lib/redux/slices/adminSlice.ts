import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getLocalStorageItem } from '@/lib/utils/localStorage';

// Types
export interface User {
  id: number;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
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
  doctorName: string;
  doctorSpecialization: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  monthAppointments: number;
  recentAppointments: Appointment[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminState {
  // Dashboard
  stats: DashboardStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // Users
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  usersPagination: Pagination | null;

  // Doctors
  doctors: Doctor[];
  doctorsLoading: boolean;
  doctorsError: string | null;
  doctorsPagination: Pagination | null;

  // Patients
  patients: Patient[];
  patientsLoading: boolean;
  patientsError: string | null;
  patientsPagination: Pagination | null;

  // Appointments
  appointments: Appointment[];
  appointmentsLoading: boolean;
  appointmentsError: string | null;
  appointmentsPagination: Pagination | null;

  // Filters
  userFilters: {
    search: string;
    role: string;
    page: number;
    limit: number;
  };
  doctorFilters: {
    search: string;
    specialization: string;
    page: number;
    limit: number;
  };
  patientFilters: {
    search: string;
    bloodGroup: string;
    page: number;
    limit: number;
  };
  appointmentFilters: {
    search: string;
    status: string;
    dateFrom: string;
    dateTo: string;
    page: number;
    limit: number;
  };
}

const initialState: AdminState = {
  // Dashboard
  stats: null,
  statsLoading: false,
  statsError: null,

  // Users
  users: [],
  usersLoading: false,
  usersError: null,
  usersPagination: null,

  // Doctors
  doctors: [],
  doctorsLoading: false,
  doctorsError: null,
  doctorsPagination: null,

  // Patients
  patients: [],
  patientsLoading: false,
  patientsError: null,
  patientsPagination: null,

  // Appointments
  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
  appointmentsPagination: null,

  // Filters
  userFilters: {
    search: '',
    role: '',
    page: 1,
    limit: 10,
  },
  doctorFilters: {
    search: '',
    specialization: '',
    page: 1,
    limit: 10,
  },
  patientFilters: {
    search: '',
    bloodGroup: '',
    page: 1,
    limit: 10,
  },
  appointmentFilters: {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
  },
};

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      const backendData = data.data;
      
      // Transform backend nested structure to flat structure
      return {
        totalUsers: backendData.totals.users,
        totalDoctors: backendData.totals.doctors,
        totalPatients: backendData.totals.patients,
        totalAppointments: backendData.totals.appointments,
        todayAppointments: 0,
        weekAppointments: backendData.recent?.appointments || 0,
        monthAppointments: 0,
        recentAppointments: []
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (filters: Partial<AdminState['userFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Transform snake_case to camelCase
      // Backend returns: { data: [...users array...], meta: { pagination } }
      const transformedUsers = data.data.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.date_of_birth,
        address: user.address,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
      
      return {
        data: transformedUsers,
        pagination: data.meta.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchDoctors = createAsyncThunk(
  'admin/fetchDoctors',
  async (filters: Partial<AdminState['doctorFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/admin/doctors?${params}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      
      // Transform snake_case to camelCase
      // Backend returns: { data: [...doctors array...], meta: { pagination } }
      const transformedDoctors = data.data.map((doctor: any) => ({
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.first_name,
        lastName: doctor.last_name,
        phone: doctor.phone,
        gender: doctor.gender,
        dateOfBirth: doctor.date_of_birth,
        address: doctor.address,
        specialization: doctor.specialization,
        licenseNumber: doctor.license_number,
        qualification: doctor.qualification,
        experienceYears: doctor.experience_years,
        consultationFee: doctor.consultation_fee,
        createdAt: doctor.created_at,
        updatedAt: doctor.updated_at
      }));
      
      return {
        data: transformedDoctors,
        pagination: data.meta.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchPatients = createAsyncThunk(
  'admin/fetchPatients',
  async (filters: Partial<AdminState['patientFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/admin/patients?${params}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      
      // Transform snake_case to camelCase
      // Backend returns: { data: [...patients array...], meta: { pagination } }
      const transformedPatients = data.data.map((patient: any) => ({
        id: patient.id,
        email: patient.email,
        firstName: patient.first_name,
        lastName: patient.last_name,
        phone: patient.phone,
        gender: patient.gender,
        dateOfBirth: patient.date_of_birth,
        address: patient.address,
        bloodGroup: patient.blood_group,
        allergies: patient.allergies,
        emergencyContact: patient.emergency_contact,
        createdAt: patient.created_at,
        updatedAt: patient.updated_at
      }));
      
      return {
        data: transformedPatients,
        pagination: data.meta.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  'admin/fetchAppointments',
  async (filters: Partial<AdminState['appointmentFilters']>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/admin/appointments?${params}`, {
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      
      // Transform snake_case to camelCase
      // Backend returns: { data: [...appointments array...], meta: { pagination } }
      const transformedAppointments = data.data.map((appointment: any) => ({
        id: appointment.id,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
        // Patient info
        patientId: appointment.patient_id,
        patientEmail: appointment.patient_email,
        patientFirstName: appointment.patient_first_name,
        patientLastName: appointment.patient_last_name,
        patientName: `${appointment.patient_first_name || ''} ${appointment.patient_last_name || ''}`.trim(),
        patientPhone: appointment.patient_phone,
        patientGender: appointment.patient_gender,
        // Doctor info
        doctorId: appointment.doctor_id,
        doctorEmail: appointment.doctor_email,
        doctorFirstName: appointment.doctor_first_name,
        doctorLastName: appointment.doctor_last_name,
        doctorName: `${appointment.doctor_first_name || ''} ${appointment.doctor_last_name || ''}`.trim(),
        doctorPhone: appointment.doctor_phone,
        doctorSpecialization: appointment.specialization,
        consultationFee: appointment.consultation_fee
      }));
      
      return {
        data: transformedAppointments,
        pagination: data.meta.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: number; role: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async ({ userId, permanent = false }: { userId: number; permanent?: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}?permanent=${permanent}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getLocalStorageItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      return userId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUserFilters: (state, action: PayloadAction<Partial<AdminState['userFilters']>>) => {
      state.userFilters = { ...state.userFilters, ...action.payload };
    },
    setDoctorFilters: (state, action: PayloadAction<Partial<AdminState['doctorFilters']>>) => {
      state.doctorFilters = { ...state.doctorFilters, ...action.payload };
    },
    setPatientFilters: (state, action: PayloadAction<Partial<AdminState['patientFilters']>>) => {
      state.patientFilters = { ...state.patientFilters, ...action.payload };
    },
    setAppointmentFilters: (state, action: PayloadAction<Partial<AdminState['appointmentFilters']>>) => {
      state.appointmentFilters = { ...state.appointmentFilters, ...action.payload };
    },
    clearErrors: (state) => {
      state.statsError = null;
      state.usersError = null;
      state.doctorsError = null;
      state.patientsError = null;
      state.appointmentsError = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      });

    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.data;
        state.usersPagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload as string;
      });

    // Doctors
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.doctorsLoading = true;
        state.doctorsError = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.doctorsLoading = false;
        state.doctors = action.payload.data;
        state.doctorsPagination = action.payload.pagination;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.doctorsError = action.payload as string;
      });

    // Patients
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.patients = action.payload.data;
        state.patientsPagination = action.payload.pagination;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload as string;
      });

    // Appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload.data;
        state.appointmentsPagination = action.payload.pagination;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload as string;
      });

    // Update User Role
    builder
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.data.user;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      });

    // Delete User
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      });
  },
});

export const {
  setUserFilters,
  setDoctorFilters,
  setPatientFilters,
  setAppointmentFilters,
  clearErrors,
} = adminSlice.actions;

export default adminSlice.reducer;
