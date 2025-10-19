'use client';

import { useState } from 'react';
import { Prescription } from '@/lib/redux/slices/doctorSlice';
import PrescriptionInput from './PrescriptionInput';

interface MedicalRecordFormProps {
  appointments: Array<{ id: number; patientName: string; appointmentDate: string }>;
  onSubmit: (data: {
    appointmentId: number;
    diagnosis: string;
    symptoms?: string;
    prescriptions: Prescription[];
  }) => void;
  isLoading?: boolean;
}

export default function MedicalRecordForm({ appointments, onSubmit, isLoading }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState({
    appointmentId: '',
    diagnosis: '',
    symptoms: '',
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.appointmentId) {
      newErrors.appointmentId = 'Please select an appointment';
    }
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }
    if (prescriptions.length === 0) {
      newErrors.prescriptions = 'At least one prescription is required';
    }

    prescriptions.forEach((prescription, index) => {
      if (!prescription.medicationName.trim()) {
        newErrors[`prescription_${index}_medication`] = 'Medication name is required';
      }
      if (!prescription.dosage.trim()) {
        newErrors[`prescription_${index}_dosage`] = 'Dosage is required';
      }
      if (!prescription.frequency.trim()) {
        newErrors[`prescription_${index}_frequency`] = 'Frequency is required';
      }
      if (!prescription.duration.trim()) {
        newErrors[`prescription_${index}_duration`] = 'Duration is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onSubmit({
      appointmentId: parseInt(formData.appointmentId),
      diagnosis: formData.diagnosis,
      symptoms: formData.symptoms || undefined,
      prescriptions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Appointment Selection */}
      <div>
        <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700 mb-1">
          Select Appointment *
        </label>
        <select
          id="appointmentId"
          value={formData.appointmentId}
          onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
          className="input-field"
          required
        >
          <option value="">Choose an appointment...</option>
          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.patientName} - {new Date(appointment.appointmentDate).toLocaleDateString()}
            </option>
          ))}
        </select>
        {errors.appointmentId && (
          <p className="mt-1 text-sm text-red-600">{errors.appointmentId}</p>
        )}
      </div>

      {/* Diagnosis */}
      <div>
        <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
          Diagnosis *
        </label>
        <textarea
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          rows={4}
          className="input-field"
          placeholder="Enter diagnosis..."
          required
        />
        {errors.diagnosis && (
          <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
        )}
      </div>

      {/* Symptoms */}
      <div>
        <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
          Symptoms
        </label>
        <textarea
          id="symptoms"
          value={formData.symptoms}
          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          rows={3}
          className="input-field"
          placeholder="Enter observed symptoms..."
        />
      </div>

      {/* Prescriptions */}
      <PrescriptionInput prescriptions={prescriptions} onChange={setPrescriptions} />
      {errors.prescriptions && (
        <p className="mt-1 text-sm text-red-600">{errors.prescriptions}</p>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Medical Record'}
        </button>
      </div>
    </form>
  );
}
