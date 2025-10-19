'use client';

import { useState, FormEvent } from 'react';
import {
  validateEmail,
  validatePasswordStrength,
  formatPhoneNumber,
  validatePhoneNumber,
  RegisterData,
} from '@/lib/auth';

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
}

export default function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Account Details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');

  // Step 2: Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  // Step 3: Role-Specific Info - Doctor
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  // Step 3: Role-Specific Info - Patient
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!gender) {
      newErrors.gender = 'Please select gender';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (role === 'doctor') {
      if (!specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
      if (!qualification.trim()) {
        newErrors.qualification = 'Qualification is required';
      }
      if (!experienceYears) {
        newErrors.experienceYears = 'Experience is required';
      }
      if (!consultationFee) {
        newErrors.consultationFee = 'Consultation fee is required';
      }
    } else if (role === 'patient') {
      if (!bloodGroup) {
        newErrors.bloodGroup = 'Blood group is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    const data: RegisterData = {
      email,
      password,
      role,
      firstName,
      lastName,
      phone: phone.replace(/[^\d+]/g, ''), // Keep + and digits
      dateOfBirth,
      gender,
      address,
    };

    if (role === 'doctor') {
      data.specialization = specialization;
      data.licenseNumber = licenseNumber;
      data.qualification = qualification;
      data.experienceYears = parseInt(experienceYears);
      data.consultationFee = parseFloat(consultationFee);
    } else if (role === 'patient') {
      data.bloodGroup = bloodGroup;
      data.allergies = allergies || undefined;
      data.emergencyContact = emergencyContact ? emergencyContact.replace(/[^\d+]/g, '') : undefined;
    }

    await onSubmit(data);
  };

  const passwordStrength = password ? validatePasswordStrength(password) : null;

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Account</span>
          <span>Personal</span>
          <span>Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* STEP 1: Account Details */}
        {currentStep === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.strength === 'weak'
                            ? 'bg-red-500 w-1/3'
                            : passwordStrength.strength === 'medium'
                            ? 'bg-yellow-500 w-2/3'
                            : 'bg-green-500 w-full'
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength === 'weak'
                          ? 'text-red-600'
                          : passwordStrength.strength === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {passwordStrength.strength}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Re-enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Register As *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'patient', label: 'Patient', icon: '👤' },
                  { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
                ].map((roleOption) => (
                  <button
                    key={roleOption.value}
                    type="button"
                    onClick={() => setRole(roleOption.value)}
                    className={`p-4 rounded-lg border-2 transition ${
                      role === roleOption.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="text-3xl mb-2">{roleOption.icon}</div>
                    <div className="font-medium">{roleOption.label}</div>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
          </>
        )}

        {/* STEP 2: Personal Information */}
        {currentStep === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="John"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Doe"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number * <span className="text-gray-500 text-xs">(Pakistan format: +92 XXX XXXXXXX)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setPhone(formatted);
                }}
                className={`w-full px-4 py-3 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="+92 300 1234567"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter your full address"
                disabled={isLoading}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
          </>
        )}

        {/* STEP 3: Role-Specific Info */}
        {currentStep === 3 && (
          <>
            {role === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      errors.specialization ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., Cardiology, Dermatology"
                    disabled={isLoading}
                  />
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Medical license number"
                    disabled={isLoading}
                  />
                  {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      errors.qualification ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., MBBS, MD"
                    disabled={isLoading}
                  />
                  {errors.qualification && (
                    <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (years) *
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className={`w-full px-4 py-3 border ${
                        errors.experienceYears ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="5"
                      min="0"
                      disabled={isLoading}
                    />
                    {errors.experienceYears && (
                      <p className="mt-1 text-sm text-red-600">{errors.experienceYears}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Fee ($) *
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className={`w-full px-4 py-3 border ${
                        errors.consultationFee ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="100"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                    {errors.consultationFee && (
                      <p className="mt-1 text-sm text-red-600">{errors.consultationFee}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {role === 'patient' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      errors.bloodGroup ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={isLoading}
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors.bloodGroup && (
                    <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies (Optional)
                  </label>
                  <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List any known allergies"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact (Optional) <span className="text-gray-500 text-xs">(Pakistan format: +92 XXX XXXXXXX)</span>
                  </label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setEmergencyContact(formatted);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+92 300 1234567"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Back
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
