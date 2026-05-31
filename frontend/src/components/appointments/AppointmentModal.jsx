import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','12:30 PM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM',
];

export default function AppointmentModal({ onClose, onSuccess }) {
  const { user } = useAuth();

  const [form, setForm]             = useState({
    patientId: '', doctorId: '', date: '', timeSlot: '', notes: ''
  });
  const [patients, setPatients]     = useState([]);
  const [doctors, setDoctors]       = useState([]);
  const [myPatientId, setMyPatientId] = useState('');  // ← yeh missing tha
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    // Doctors sab ke liye load karo
    api.get('/auth/doctors')
      .then(({ data }) => setDoctors(data.doctors || []))
      .catch(() => toast.error('Doctors load nahi hue'));

    if (user.role === 'patient') {
      // Patient apna record load kare
      api.get('/patients/profile/me')
        .then(({ data }) => {
          const pid = data.patient?._id;
          if (pid) {
            setMyPatientId(pid);
            setForm(prev => ({ ...prev, patientId: pid }));
          } else {
            toast.error('Profile complete karein pehle');
          }
        })
        .catch((err) => {
          console.error('Profile error:', err);
          toast.error('Profile load nahi hua');
        });
    } else {
      // Staff ke liye patients list
      api.get('/patients')
        .then(({ data }) => setPatients(data.patients || []))
        .catch(() => toast.error('Patients load nahi hue'));
    }
  }, [user.role]);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.patientId) {
      toast.error('Patient ID missing — pehle profile complete karein');
      return;
    }
    if (!form.doctorId) {
      toast.error('Doctor select karein');
      return;
    }

    setLoading(true);
    try {
      await api.post('/appointments', form);
      toast.success('Appointment booked!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Book Appointment</h2>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Patient — staff ke liye dropdown, patient ke liye info box */}
          {user.role !== 'patient' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <select name="patientId" required
                value={form.patientId} onChange={handleChange}
                className="input-field">
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {p.contact}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={`p-3 rounded-xl ${myPatientId ? 'bg-blue-50' : 'bg-red-50'}`}>
              <p className={`text-xs font-medium ${myPatientId ? 'text-blue-600' : 'text-red-600'}`}>
                {myPatientId ? 'Booking for' : '⚠️ Profile incomplete'}
              </p>
              <p className="font-semibold text-gray-900 mt-0.5">{user.name}</p>
              {!myPatientId && (
                <p className="text-xs text-red-500 mt-1">
                  Pehle Profile page mein apni info save karein
                </p>
              )}
            </div>
          )}

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor *
            </label>
            <select name="doctorId" required
              value={form.doctorId} onChange={handleChange}
              className="input-field">
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input type="date" name="date" required
                min={new Date().toISOString().split('T')[0]}
                value={form.date} onChange={handleChange}
                className="input-field"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Slot *
              </label>
              <select name="timeSlot" required
                value={form.timeSlot} onChange={handleChange}
                className="input-field">
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea name="notes" rows={2}
              value={form.notes} onChange={handleChange}
              placeholder="Any special notes..."
              className="input-field resize-none"/>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700
                rounded-lg hover:bg-gray-50 text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (user.role === 'patient' && !myPatientId)}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50">
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}