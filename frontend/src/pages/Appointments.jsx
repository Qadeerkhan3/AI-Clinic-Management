import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AppointmentModal from '../components/appointments/AppointmentModal';

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_NEXT = {
  pending:   'confirmed',
  confirmed: 'completed',
};

export default function Appointments() {
  const { user }                    = useAuth();
  const [appointments, setAppts]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [filter, setFilter]         = useState('all');

  const fetchAppts = () => {
    setLoading(true);
    api.get('/appointments')
      .then(({ data }) => setAppts(data.appointments))
      .catch(() => toast.error('Appointments load nahi huin'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppts(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Status update ho gaya: ${status}`);
      fetchAppts();
    } catch {
      toast.error('Status update nahi hua');
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Total: {appointments.length}</p>
        </div>
        {['admin','receptionist','patient'].includes(user.role) && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Book Appointment
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all','pending','confirmed','completed','cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize
              ${filter === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl">📅</span>
          <p className="text-gray-500 mt-4">There is No  appointment</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Patient','Doctor','Date','Time Slot','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(appt => (
                  <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {appt.patientId?.name || '—'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {appt.patientId?.contact}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {appt.doctorId?.name || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {new Date(appt.date).toLocaleDateString('en-PK')}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {appt.timeSlot}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                        ${STATUS_STYLES[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Next status button */}
                        {['admin','doctor','receptionist'].includes(user.role) &&
                          STATUS_NEXT[appt.status] && (
                          <button
                            onClick={() => handleStatusUpdate(appt._id, STATUS_NEXT[appt.status])}
                            className="text-xs text-primary-600 hover:text-primary-700
                              font-medium px-2.5 py-1.5 bg-primary-50 rounded-lg
                              hover:bg-primary-100 transition-colors capitalize"
                          >
                            → {STATUS_NEXT[appt.status]}
                          </button>
                        )}
                        {/* Cancel button */}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                            className="text-xs text-red-600 hover:text-red-700
                              font-medium px-2.5 py-1.5 bg-red-50 rounded-lg
                              hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <AppointmentModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchAppts(); setShowModal(false); }}
        />
      )}
    </div>
  );
}