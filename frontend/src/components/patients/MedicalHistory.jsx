import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function MedicalHistory({ patientId }) {
  const [history, setHistory] = useState({ appointments: [], prescriptions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/appointments?patientId=${patientId}`),
      api.get(`/prescriptions/patient/${patientId}`),
    ]).then(([aRes, pRes]) => {
      setHistory({
        appointments:  aRes.data.appointments  || [],
        prescriptions: pRes.data.prescriptions || [],
      });
    }).finally(() => setLoading(false));
  }, [patientId]);

  // Merge and sort by date
  const timeline = [
    ...history.appointments.map(a => ({
      type: 'appointment', date: new Date(a.date),
      title: `Appointment — ${a.status}`,
      sub: `Dr. ${a.doctorId?.name} · ${a.timeSlot}`,
      color: 'bg-blue-100 text-blue-700',
      icon: '📅',
    })),
    ...history.prescriptions.map(p => ({
      type: 'prescription', date: new Date(p.createdAt),
      title: `Prescription — ${p.diagnosis}`,
      sub: `Dr. ${p.doctorId?.name} · ${p.medicines.length} medicines`,
      color: 'bg-green-100 text-green-700',
      icon: '💊',
    })),
  ].sort((a, b) => b.date - a.date);

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"/>
    </div>
  );

  if (timeline.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <span className="text-4xl">📋</span>
      <p className="mt-3 text-sm">No History Available</p>
    </div>
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"/>

      <div className="space-y-4">
        {timeline.map((item, i) => (
          <div key={i} className="flex items-start gap-4 relative">
            {/* Icon dot */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              text-base shrink-0 z-10 ${item.color}`}>
              {item.icon}
            </div>
            {/* Content */}
            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4
              shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                <span className="text-xs text-gray-400 shrink-0">
                  {item.date.toLocaleDateString('en-PK', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}