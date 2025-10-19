'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { removeToast } from '@/lib/redux/slices/uiSlice';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function Toast() {
  const dispatch = useAppDispatch();
  const { toasts } = useAppSelector((state) => state.ui);

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto ${getBackgroundColor(
            toast.type
          )}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(toast.type)}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className={`text-sm font-medium ${getTextColor(toast.type)}`}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className={`mt-1 text-sm ${getTextColor(toast.type)} opacity-90`}>
                    {toast.message}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className={`rounded-md inline-flex ${getTextColor(toast.type)} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  onClick={() => dispatch(removeToast(toast.id))}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
