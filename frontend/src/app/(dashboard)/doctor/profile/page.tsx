'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchDoctorProfile, updateDoctorProfile } from '@/lib/redux/slices/doctorSlice';
import { addToast } from '@/lib/redux/slices/uiSlice';
import { UserCircleIcon, BriefcaseIcon, AcademicCapIcon /*, KeyIcon */ } from '@heroicons/react/24/outline';

export default function DoctorProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, profileLoading } = useAppSelector((state) => state.doctor);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    specialization: '',
    qualification: '',
    experienceYears: 0,
    consultationFee: 0,
  });

  /* Password change functionality commented out as requested
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  */

  useEffect(() => {
    dispatch(fetchDoctorProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        specialization: profile.specialization || '',
        qualification: profile.qualification || '',
        experienceYears: profile.experienceYears || 0,
        consultationFee: profile.consultationFee || 0,
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await dispatch(updateDoctorProfile(formData)).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Success',
        message: 'Profile updated successfully',
      }));
      setIsEditing(false);
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: error as string || 'Failed to update profile',
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  /* Password change functionality commented out as requested
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'Passwords do not match',
      }));
      return;
    }

    // This would call a password change API endpoint
    dispatch(addToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Password change functionality will be implemented soon',
    }));
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };
  */

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
        <p className="mt-2 text-gray-600">Manage your professional information</p>
      </div>

      {/* Personal Information */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <UserCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">First Name</label>
            <p className="text-base font-medium text-gray-900">{profile.firstName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Last Name</label>
            <p className="text-base font-medium text-gray-900">{profile.lastName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-base font-medium text-gray-900">{profile.email}</p>
          </div>
          {profile.phone && (
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="text-base font-medium text-gray-900">{profile.phone}</p>
            </div>
          )}
          {profile.gender && (
            <div>
              <label className="text-sm text-gray-500">Gender</label>
              <p className="text-base font-medium text-gray-900">
                {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Details */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BriefcaseIcon className="h-6 w-6 mr-2 text-blue-600" />
            Professional Details
          </h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{profile.specialization}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <p className="text-base font-medium text-gray-900">{profile.licenseNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years) *
              </label>
              {isEditing ? (
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                  className="input-field"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{profile.experienceYears} years</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee *
              </label>
              {isEditing ? (
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) })}
                  className="input-field"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">${profile.consultationFee}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification
              </label>
              {isEditing ? (
                <textarea
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Enter your qualifications..."
                />
              ) : (
                <p className="text-base font-medium text-gray-900">
                  {profile.qualification || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setFormData({
                      specialization: profile.specialization || '',
                      qualification: profile.qualification || '',
                      experienceYears: profile.experienceYears || 0,
                      consultationFee: profile.consultationFee || 0,
                    });
                  }
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password - Commented out as requested
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <KeyIcon className="h-6 w-6 mr-2 text-blue-600" />
            Change Password
          </h2>
          {!showPasswordForm && (
            <button onClick={() => setShowPasswordForm(true)} className="btn-secondary">
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      */}

      {/* Account Information */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-600" />
          Account Information
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Account Created:</span>
            <span className="font-medium text-gray-900">
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Doctor ID:</span>
            <span className="font-medium text-gray-900">#{profile.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
