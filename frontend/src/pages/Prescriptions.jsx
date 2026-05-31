import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PrescriptionModal from '../components/prescriptions/PrescriptionModal';
import PrescriptionDetail from '../components/prescriptions/PrescriptionDetail';

export default function Prescriptions() {
  const { user }                          = useAuth();
  const [patients, setPatients]           = useState([]);
  const [selected, setSelected]           = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [viewPrescription, setView]       = useState(null);

  useEffect(() => {
    // Sirf staff patients list load kare
    if (user.role !== 'patient') {
      api.get('/patients')
        .then(({ data }) => setPatients(data.patients || []))
        .catch(() => {}); // silent
    }

    // Patient apni prescriptions seedha load kare
    if (user.role === 'patient') {
      setLoading(true);
      api.get('/patients/my-prescriptions')
        .then(({ data }) => setPrescriptions(data.prescriptions || []))
        .catch(() => toast.error('Prescriptions load nahi huin'))
        .finally(() => setLoading(false));
    }
  }, [user.role]);

  const fetchPrescriptions = (patientId) => {
    if (!patientId) return;
    setLoading(true);
    api.get(`/prescriptions/patient/${patientId}`)
      .then(({ data }) => setPrescriptions(data.prescriptions || []))
      .catch(() => toast.error('Prescriptions load nahi huin'))
      .finally(() => setLoading(false));
  };

  const handlePatientChange = (e) => {
    setSelected(e.target.value);
    fetchPrescriptions(e.target.value);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.role === 'patient'
              ? 'Your prescription history'
              : 'Patient prescription history'}
          </p>
        </div>
        {user.role === 'doctor' && selected && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2">
            <span>+</span> New Prescription
          </button>
        )}
      </div>

      {/* Patient selector — sirf staff ke liye */}
      {user.role !== 'patient' && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient
          </label>
          <select
            value={selected}
            onChange={handlePatientChange}
            className="input-field max-w-sm">
            <option value="">— Select a patient —</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.age} yrs, {p.gender})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Prescriptions list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl">💊</span>
          <p className="text-gray-500 mt-4">
            {user.role === 'patient'
              ? 'No prescriptions yet'
              : selected
                ? 'No prescriptions found'
                : 'Select a patient above'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => (
            <div
              key={rx._id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setView(rx)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{rx.diagnosis}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Dr. {rx.doctorId?.name} ·{' '}
                    {new Date(rx.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {rx.medicines.length} medicines
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {rx.medicines.slice(0, 3).map((m, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {m.name} {m.dosage}
                  </span>
                ))}
                {rx.medicines.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    +{rx.medicines.length - 3} more
                  </span>
                )}
              </div>

              <p className="text-xs text-primary-600 mt-3 font-medium">
                Click to view details + PDF →
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <PrescriptionModal
          patientId={selected}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchPrescriptions(selected);
            setShowModal(false);
          }}
        />
      )}

      {viewPrescription && (
        <PrescriptionDetail
          prescription={viewPrescription}
          onClose={() => setView(null)}
        />
      )}
    </div>
  );
}