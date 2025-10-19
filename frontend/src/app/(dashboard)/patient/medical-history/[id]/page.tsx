'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchMedicalRecordById } from '@/lib/redux/slices/patientSlice';
import { format } from 'date-fns';
import {
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

const formatTime = (timeString: string) => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
};

export default function MedicalRecordDetail() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentMedicalRecord, currentMedicalRecordLoading } = useAppSelector((state) => state.patient);

  const recordId = Number(params.id);

  useEffect(() => {
    if (recordId) {
      dispatch(fetchMedicalRecordById(recordId));
    }
  }, [dispatch, recordId]);

  const handleDownloadPrescription = () => {
    // In a real app, this would generate and download a PDF
    alert('Prescription download functionality would be implemented here');
  };

  if (currentMedicalRecordLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentMedicalRecord) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Medical record not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical Record</h1>
          <p className="mt-2 text-sm text-gray-600">Record #{currentMedicalRecord.id}</p>
        </div>

        {/* Doctor & Visit Info */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Doctor</p>
                <p className="text-sm text-gray-600">
                  Dr. {currentMedicalRecord.doctorName}
                </p>
                {currentMedicalRecord.specialization && (
                  <p className="text-xs text-blue-600 mt-1">
                    {currentMedicalRecord.specialization}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Visit Date</p>
                <p className="text-sm text-gray-600">
                  {currentMedicalRecord.appointmentDate 
                    ? formatDate(currentMedicalRecord.appointmentDate)
                    : formatDate(currentMedicalRecord.createdAt)}
                  {currentMedicalRecord.appointmentTime && (
                    <span className="ml-2">at {formatTime(currentMedicalRecord.appointmentTime)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Details */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Details</h2>
          <div className="space-y-4">
            {currentMedicalRecord.symptoms && (
              <div>
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Symptoms</h3>
                </div>
                <p className="text-sm text-gray-700 ml-7">{currentMedicalRecord.symptoms}</p>
              </div>
            )}

            <div>
              <div className="flex items-center mb-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Diagnosis</h3>
              </div>
              <p className="text-sm text-gray-700 ml-7">{currentMedicalRecord.diagnosis}</p>
            </div>

            {currentMedicalRecord.notes && (
              <div>
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Additional Notes</h3>
                </div>
                <p className="text-sm text-gray-700 ml-7">{currentMedicalRecord.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Prescriptions */}
        {currentMedicalRecord.prescriptions &&
          currentMedicalRecord.prescriptions.length > 0 && (
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Prescriptions</h2>
                {/* <button
                  onClick={handleDownloadPrescription}
                  className="btn-secondary text-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
                  Download PDF
                </button> */}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medication
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dosage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentMedicalRecord.prescriptions.map((prescription: { medicationName: string; dosage: string; frequency: string; duration: string; instructions?: string }, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prescription.medicationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {prescription.dosage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {prescription.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {prescription.duration}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {prescription.instructions || 'Take as directed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex-1"
          >
            Back to Medical History
          </button>
          {/* <button onClick={handleDownloadPrescription} className="btn-primary flex-1">
            <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
            Download Complete Record
          </button> */}
        </div>
      </div>
    </div>
  );
}
