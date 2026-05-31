import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ReceptionistModal from '../../components/admin/ReceptionistModal';

export default function ManageReceptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editReceptionist, setEditReceptionist] = useState(null);

  const fetchReceptionists = () => {
    setLoading(true);
    api.get('/admin/receptionists')
      .then(({ data }) => setReceptionists(data.receptionists))
      .catch(() => toast.error('Receptionists load nahi hue'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReceptionists(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Is receptionist ko delete karna hai?')) return;
    try {
      await api.delete(`/admin/receptionists/${id}`);
      toast.success('Receptionist delete ho gaya');
      fetchReceptionists();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete nahi hua');
    }
  };

  const handleEdit = (rec) => {
    setEditReceptionist(rec);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditReceptionist(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Receptionists</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: {receptionists.length} receptionists
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Receptionist
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/>
        </div>
      ) : receptionists.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl">👩‍💼</span>
          <p className="text-gray-500 mt-4"> No receptionist Available </p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            Add First Receptionist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receptionists.map((rec) => (
            <div key={rec._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xl">
                    👩‍💼
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{rec.name}</h3>
                    <p className="text-xs text-gray-500">{rec.email}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${rec.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {rec.isActive !== false ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded-full ${rec.subscriptionPlan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {rec.subscriptionPlan === 'pro' ? '⭐ Pro' : '📋 Free'}
                </span>
                <span>Joined: {new Date(rec.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleEdit(rec)}
                  className="flex-1 text-sm text-purple-600 hover:bg-purple-50 py-2 rounded-lg font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rec._id)}
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
        <ReceptionistModal
          receptionist={editReceptionist}
          onClose={handleModalClose}
          onSuccess={() => { fetchReceptionists(); handleModalClose(); }}
        />
      )}
    </div>
  );
}