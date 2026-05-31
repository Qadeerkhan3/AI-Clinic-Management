import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PatientModal from '../components/patients/PatientModal';
import PatientCard  from '../components/patients/PatientCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Patients() {
  const { user }                      = useAuth();
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [deleteId, setDeleteId]       = useState(null);

  const fetchPatients = () => {
    setLoading(true);
    api.get('/patients')
      .then(({ data }) => setPatients(data.patients))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/patients/${deleteId}`);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch {
      toast.error('Failed to delete patient');
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (patient) => {
    setEditPatient(patient);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditPatient(null);
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.contact.includes(search)
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: {patients.length} patients
          </p>
        </div>
        {['admin','receptionist'].includes(user.role) && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add Patient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name or contact..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl">🔍</span>
          <p className="text-gray-500 mt-4">No patients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(patient => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={['admin','receptionist'].includes(user.role)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PatientModal
          patient={editPatient}
          onClose={handleModalClose}
          onSuccess={() => { fetchPatients(); handleModalClose(); }}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Patient"
        message="Are you sure you want to delete this patient record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />
    </div>
  );
}