import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', notes: '' };

export default function PrescriptionModal({ patientId, onClose, onSuccess }) {
  const [diagnosis, setDiagnosis]       = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUp]     = useState('');
  const [medicines, setMedicines]       = useState([{ ...emptyMed }]);
  const [loading, setLoading]           = useState(false);

  const addMedicine = () => setMedicines(prev => [...prev, { ...emptyMed }]);

  const removeMedicine = (i) =>
    setMedicines(prev => prev.filter((_, idx) => idx !== i));

  const updateMedicine = (i, field, value) =>
    setMedicines(prev => prev.map((m, idx) =>
      idx === i ? { ...m, [field]: value } : m
    ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medicines.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      return toast.error('Please fill in all medicine details');
    }
    setLoading(true);
    try {
      await api.post('/prescriptions', {
        patientId, diagnosis, instructions, followUpDate, medicines,
      });
      toast.success('Prescription saved successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Create Prescription</h2>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <input required value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              placeholder="e.g. Viral Fever, Hypertension"
              className="input-field"/>
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Medicines *
              </label>
              <button type="button" onClick={addMedicine}
                className="text-sm text-primary-600 hover:text-primary-700
                  font-medium flex items-center gap-1">
                + Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={i}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Medicine {i + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(i)}
                        className="text-red-500 hover:text-red-600 text-xs font-medium">
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        placeholder="Medicine name *"
                        value={med.name}
                        onChange={e => updateMedicine(i, 'name', e.target.value)}
                        className="input-field bg-white text-sm"
                      />
                    </div>
                    <input
                      placeholder="Dosage * (e.g. 500mg)"
                      value={med.dosage}
                      onChange={e => updateMedicine(i, 'dosage', e.target.value)}
                      className="input-field bg-white text-sm"
                    />
                    <input
                      placeholder="Frequency * (e.g. 2x daily)"
                      value={med.frequency}
                      onChange={e => updateMedicine(i, 'frequency', e.target.value)}
                      className="input-field bg-white text-sm"
                    />
                    <input
                      placeholder="Duration * (e.g. 7 days)"
                      value={med.duration}
                      onChange={e => updateMedicine(i, 'duration', e.target.value)}
                      className="input-field bg-white text-sm"
                    />
                    <input
                      placeholder="Notes (optional)"
                      value={med.notes}
                      onChange={e => updateMedicine(i, 'notes', e.target.value)}
                      className="input-field bg-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions + Follow Up */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea rows={2} value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Take after meals, drink plenty of water..."
                className="input-field resize-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date
              </label>
              <input type="date" value={followUpDate}
                onChange={e => setFollowUp(e.target.value)}
                className="input-field"/>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700
                rounded-lg hover:bg-gray-50 text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}