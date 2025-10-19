'use client';

import { Prescription } from '@/lib/redux/slices/doctorSlice';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PrescriptionInputProps {
  prescriptions: Prescription[];
  onChange: (prescriptions: Prescription[]) => void;
}

export default function PrescriptionInput({ prescriptions, onChange }: PrescriptionInputProps) {
  const addPrescription = () => {
    onChange([
      ...prescriptions,
      {
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const removePrescription = (index: number) => {
    onChange(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = prescriptions.map((prescription, i) => {
      if (i === index) {
        return { ...prescription, [field]: value };
      }
      return prescription;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Prescriptions</h3>
        <button
          type="button"
          onClick={addPrescription}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Prescription
        </button>
      </div>

      {prescriptions.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          No prescriptions added yet. Click &quot;Add Prescription&quot; to get started.
        </p>
      )}

      {prescriptions.map((prescription, index) => (
        <div key={index} className="card p-4 space-y-3 relative">
          <button
            type="button"
            onClick={() => removePrescription(index)}
            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
          >
            <TrashIcon className="h-5 w-5" />
          </button>

          <div className="pr-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication Name *
            </label>
            <input
              type="text"
              required
              value={prescription.medicationName}
              onChange={(e) => updatePrescription(index, 'medicationName', e.target.value)}
              className="input-field"
              placeholder="e.g., Amoxicillin"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage *
              </label>
              <input
                type="text"
                required
                value={prescription.dosage}
                onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                className="input-field"
                placeholder="e.g., 500mg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <input
                type="text"
                required
                value={prescription.frequency}
                onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                className="input-field"
                placeholder="e.g., 3 times daily"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <input
              type="text"
              required
              value={prescription.duration}
              onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
              className="input-field"
              placeholder="e.g., 7 days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              value={prescription.instructions}
              onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
              rows={2}
              className="input-field"
              placeholder="e.g., Take after meals"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
