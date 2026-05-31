import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PrescriptionDetail({ prescription: rx, onClose }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData]       = useState(null);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/prescriptions/${rx._id}/pdf`, {
        responseType: 'blob'
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `prescription-${rx._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloading PDF...');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const handleAIExplain = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/prescription-explain', {
        medicines:    rx.medicines,
        diagnosis:    rx.diagnosis,
        instructions: rx.instructions,
      });
      setAiData(data.data);
    } catch {
      toast.error('Failed to get AI explanation');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Prescription Detail</h2>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>👨‍⚕️ Dr. {rx.doctorId?.name}</span>
            <span>📅 {new Date(rx.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}</span>
            {rx.followUpDate && (
              <span>🔄 Follow-up: {new Date(rx.followUpDate).toLocaleDateString('en-PK')}</span>
            )}
          </div>

          {/* Diagnosis */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Diagnosis</p>
            <p className="text-gray-900 font-medium">{rx.diagnosis}</p>
          </div>

          {/* Medicines */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Medicines
            </h3>
            <div className="space-y-2">
              {rx.medicines.map((m, i) => (
                <div key={i} className="flex items-start gap-4 p-3
                  bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg
                    flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {m.dosage} · {m.frequency} · {m.duration}
                    </p>
                    {m.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">{m.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {rx.instructions && (
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="text-xs font-semibold text-amber-600 uppercase mb-1">
                Instructions
              </p>
              <p className="text-gray-800 text-sm">{rx.instructions}</p>
            </div>
          )}

          {/* AI Explanation */}
          {aiData && (
            <div className="p-4 bg-purple-50 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-purple-600 uppercase">
                AI Explanation
              </p>
              <p className="text-sm text-gray-800">{aiData.simpleExplanation}</p>
              {aiData.lifestyleAdvice?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Lifestyle Advice:</p>
                  <ul className="space-y-1">
                    {aiData.lifestyleAdvice.map((a, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-2">
                        <span className="text-purple-500">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiData.sideEffectsWarning && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                  ⚠️ {aiData.sideEffectsWarning}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
            >
              📥 Download PDF
            </button>
            <button
              onClick={handleAIExplain}
              disabled={aiLoading}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white
                font-medium rounded-lg transition-colors disabled:opacity-50
                flex items-center justify-center gap-2"
            >
              {aiLoading ? 'AI is thinking...' : '🤖 AI Explain'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}