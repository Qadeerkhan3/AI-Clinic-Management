import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import DoctorModal from '../../components/admin/DoctorModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function ManageDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchDoctors = () => {
    setLoading(true);
    api.get('/admin/doctors')
      .then(({ data }) => setDoctors(data.doctors))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/doctors/${deleteId}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (doc) => {
    setEditDoctor(doc);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditDoctor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: {doctors.length} doctors
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Doctor
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl">👨‍⚕️</span>
          <p className="text-gray-500 mt-4">No Doctors Available</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            Add First Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <div key={doc._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center text-xl">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {doc.name}</h3>
                    <p className="text-xs text-gray-500">{doc.email}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${doc.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {doc.isActive !== false ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded-full ${doc.subscriptionPlan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {doc.subscriptionPlan === 'pro' ? '⭐ Pro' : '📋 Free'}
                </span>
                <span>Joined: {new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleEdit(doc)}
                  className="flex-1 text-sm text-primary-600 hover:bg-primary-50 py-2 rounded-lg font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="flex-1 text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <DoctorModal
          doctor={editDoctor}
          onClose={handleModalClose}
          onSuccess={() => { fetchDoctors(); handleModalClose(); }}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor account? This action will permanently remove their records from the system."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />
    </div>
  );
}