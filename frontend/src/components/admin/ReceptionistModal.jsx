import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  email: '',
  password: '',
  subscriptionPlan: 'free',
  isActive: true,
};

export default function ReceptionistModal({ receptionist, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (receptionist) {
      setForm({
        name: receptionist.name || '',
        email: receptionist.email || '',
        password: '',
        subscriptionPlan: receptionist.subscriptionPlan || 'free',
        isActive: receptionist.isActive !== false,
      });
    } else {
      setForm(initialForm);
    }
  }, [receptionist]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!receptionist && !form.password) {
      return toast.error('Password dalna zaroori hai');
    }
    
    setLoading(true);
    try {
      if (receptionist) {
        await api.put(`/admin/receptionists/${receptionist._id}`, {
          name: form.name,
          email: form.email,
          isActive: form.isActive,
          subscriptionPlan: form.subscriptionPlan,
        });
        toast.success('Receptionist update ho gaya');
      } else {
        await api.post('/admin/receptionists', {
          name: form.name,
          email: form.email,
          password: form.password,
          subscriptionPlan: form.subscriptionPlan,
        });
        toast.success('Receptionist add ho gaya');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error aa gaya');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {receptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="name" type="text" required value={form.name} onChange={handleChange}
              placeholder="Sara Ahmed" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange}
              placeholder="reception@clinic.com" className="input-field" />
          </div>

          {!receptionist && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange}
                placeholder="••••••••" className="input-field" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
            <select name="subscriptionPlan" value={form.subscriptionPlan} onChange={handleChange} className="input-field">
              <option value="free">Free Plan</option>
              <option value="pro">Pro Plan</option>
            </select>
          </div>

          {receptionist && (
            <div className="flex items-center gap-3">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded border-gray-300" />
              <label className="text-sm text-gray-700">Active (Receptionist can login)</label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 bg-purple-600 hover:bg-purple-700">
              {loading ? 'Saving...' : receptionist ? 'Update' : 'Add Receptionist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}