'use client';

interface TimelineItem {
  id: number;
  date: string;
  doctorName: string;
  specialization: string;
  diagnosis: string;
  type: 'appointment' | 'medical-record';
}

interface AppointmentTimelineProps {
  items: TimelineItem[];
}

export default function AppointmentTimeline({ items }: AppointmentTimelineProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, itemIdx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {itemIdx !== items.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                {/* Icon */}
                <div>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${
                      item.type === 'medical-record'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    {item.type === 'medical-record' ? (
                      <svg
                        className="h-5 w-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {item.doctorName}
                        </p>
                        <p className="text-xs text-gray-500">{item.specialization}</p>
                      </div>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{item.diagnosis}</p>
                    <span
                      className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.type === 'medical-record'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.type === 'medical-record' ? 'Medical Record' : 'Appointment'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
