import { jwtDecode } from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthTokens {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  // Account Details
  email: string;
  password: string;
  role: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  
  // Role-Specific Info
  // Doctor
  specialization?: string;
  licenseNumber?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  
  // Patient
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Token storage utilities
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    // Also set cookie for middleware
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Also remove cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

export const setAuthUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getAuthUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

// Login function
export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      } else {
        // Response is not JSON (might be HTML error page)
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${response.status} - Unable to connect to backend server`);
      }
    }

    const data = await response.json();
    
    // Extract data from response (backend returns { success, message, data: { user, token } })
    const responseData = data.data || data;
    
    // Store token and user
    setAuthToken(responseData.token);
    setAuthUser(responseData.user);

    return responseData;
  } catch (error: any) {
    // If it's a network error
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw new Error(error.message || 'An error occurred during login');
  }
};

// Register function
export const register = async (data: RegisterData): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      } else {
        // Response is not JSON (might be HTML error page)
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${response.status} - Unable to connect to backend server`);
      }
    }

    const result = await response.json();
    // Backend returns { success, message, data }
    return { message: result.message || 'Registration successful' };
  } catch (error: any) {
    // If it's a network error
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw new Error(error.message || 'An error occurred during registration');
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    
    if (token) {
      // Call backend logout endpoint
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    removeAuthToken();
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  const token = getAuthToken();
  
  if (!token) return null;
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    removeAuthToken();
    return null;
  }
  
  return getAuthUser();
};

// Check authentication status
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  
  if (!token) return false;
  
  return !isTokenExpired(token);
};

// Get authorization header
export const getAuthHeader = (): Record<string, string> => {
  const token = getAuthToken();
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  
  return {};
};

// Validate password strength
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  if (password.length < 8) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Password must be at least 8 characters long',
    };
  }

  let strength = 0;
  
  // Check for lowercase
  if (/[a-z]/.test(password)) strength++;
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) strength++;
  
  // Check for numbers
  if (/[0-9]/.test(password)) strength++;
  
  // Check for special characters
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength < 2) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Password is too weak. Include uppercase, lowercase, numbers, and special characters.',
    };
  }

  if (strength === 2) {
    return {
      isValid: true,
      strength: 'medium',
      message: 'Password strength is medium',
    };
  }

  return {
    isValid: true,
    strength: 'strong',
    message: 'Password is strong',
  };
};

// Validate email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format phone number for Pakistan (+92) format
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with +92, format as +92 XXX XXXXXXX
  if (cleaned.startsWith('+92')) {
    const numbers = cleaned.substring(3).replace(/\D/g, '');
    if (numbers.length === 0) return '+92 ';
    if (numbers.length <= 3) return `+92 ${numbers}`;
    return `+92 ${numbers.slice(0, 3)} ${numbers.slice(3, 10)}`;
  }
  
  // If starts with 92, add + and format
  if (cleaned.startsWith('92') && !cleaned.startsWith('+')) {
    const numbers = cleaned.substring(2);
    if (numbers.length === 0) return '+92 ';
    if (numbers.length <= 3) return `+92 ${numbers}`;
    return `+92 ${numbers.slice(0, 3)} ${numbers.slice(3, 10)}`;
  }
  
  // If starts with 0, replace with +92
  if (cleaned.startsWith('0')) {
    const numbers = cleaned.substring(1);
    if (numbers.length === 0) return '+92 ';
    if (numbers.length <= 3) return `+92 ${numbers}`;
    return `+92 ${numbers.slice(0, 3)} ${numbers.slice(3, 10)}`;
  }
  
  // Otherwise, assume Pakistan number without prefix
  if (cleaned.length > 0 && !cleaned.includes('+')) {
    if (cleaned.length <= 3) return `+92 ${cleaned}`;
    return `+92 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 10)}`;
  }
  
  return phone;
};

// Clean phone number for backend (keep + and digits only)
export const cleanPhoneNumber = (phone: string): string => {
  // Keep + and digits only
  return phone.replace(/[^\d+]/g, '');
};

// Validate phone number
export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Pakistan format: +92 followed by 10 digits (total 13 chars with +)
  // Also accept 10-15 digits for international compatibility
  if (cleaned.startsWith('+92')) {
    const numbers = cleaned.substring(3);
    return numbers.length >= 10 && numbers.length <= 10;
  }
  // For other formats, check length
  const digitsOnly = cleaned.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};
