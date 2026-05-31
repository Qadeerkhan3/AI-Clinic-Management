import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const initial = {
  name: '', age: '', gender: '', contact: '',
  email: '', address: '', bloodGroup: '',
};

export default function PatientModal({ patient, onClose, onSuccess }) {
  const [form, setForm]       = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) setForm({ ...initial, ...patient });
  }, [patient]);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (patient) {
        await api.put(`/patients/${patient._id}`, form);
        toast.success('Patient update ho gaya');
      } else {
        await api.post('/patients', form);
        toast.success('Patient add ho gaya');
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {patient ? 'Patient Edit Karein' : 'Naya Patient Add Karein'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                name="name" required
                value={form.name}
                onChange={handleChange}
                placeholder="Ahmad Ali"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                name="age" type="number" required min="0" max="150"
                value={form.age}
                onChange={handleChange}
                placeholder="25"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                name="gender" required
                value={form.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact *
              </label>
              <input
                name="contact" required
                value={form.contact}
                onChange={handleChange}
                placeholder="03001234567"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email" type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="patient@email.com"
                className="input-field"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address" rows={2}
                value={form.address}
                onChange={handleChange}
                placeholder="Peshawar, KPK"
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700
                rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50"
            >
              {loading ? 'Saving...' : patient ? 'Update' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}