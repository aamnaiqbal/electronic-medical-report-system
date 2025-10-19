// Utility functions for safe localStorage access in Next.js
// This handles both client-side and server-side rendering

export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return null
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    // Server-side rendering - do nothing
    return;
  }
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const removeLocalStorageItem = (key: string): void => {
  if (typeof window === 'undefined') {
    // Server-side rendering - do nothing
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};
