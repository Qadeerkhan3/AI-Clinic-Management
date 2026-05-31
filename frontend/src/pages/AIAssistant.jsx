import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const RISK_STYLES = {
  low:    { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700',  badge: 'bg-green-100 text-green-700'  },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700'  },
  high:   { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',    badge: 'bg-red-100 text-red-700'      },
};

const URGENCY_ICONS = {
  routine:   '🟢',
  urgent:    '🟡',
  emergency: '🔴',
};

export default function AIAssistant() {
  const [form, setForm] = useState({
    symptoms: '', age: '', gender: '', history: '',
  });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.symptoms.trim()) return toast.error('Symptoms zaroor bharo');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/ai/symptom-check', form);
      if (data.fallback) {
        toast.error('AI abhi available nahi, baad mein try karein');
      } else {
        setResult(data.data);
        toast.success('AI analysis complete!');
      }
    } catch {
      toast.error('AI request fail ho gai');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({ symptoms: '', age: '', gender: '', history: '' });
    setResult(null);
  };

  const risk = result ? RISK_STYLES[result.riskLevel] || RISK_STYLES.low : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-100 rounded-2xl">
          <span className="text-3xl">🤖</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Symptom Checker</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your symptoms and get an AI analysis of possible conditions and urgency level.
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-xl shrink-0">⚠️</span>
        <p className="text-sm text-amber-800">
           Information provided by AI is for general guidance only. Please consult a doctor for a diagnosis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Input form */}
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-900">Patient Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  name="age" type="number" min="0" max="120"
                  value={form.age} onChange={handleChange}
                  placeholder="e.g. 35"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select name="gender" value={form.gender}
                  onChange={handleChange} className="input-field">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptoms * <span className="text-gray-400 font-normal">(detailed)</span>
              </label>
              <textarea
                name="symptoms" required rows={4}
                value={form.symptoms} onChange={handleChange}
                placeholder="e.g. Bukhaar 3 din se hai, sar dard, jism dard, bhookh nahi..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical History <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="history" rows={3}
                value={form.history} onChange={handleChange}
                placeholder="e.g. Diabetes hai, BP ki dawa leta hai..."
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleClear}
                className="px-4 py-2.5 border border-gray-300 text-gray-700
                  rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                Clear
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 btn-primary py-2.5 disabled:opacity-50
                  flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent
                      rounded-full animate-spin"/>
                    Analyzing...
                  </>
                ) : (
                  <> 🔍 Analyze Symptoms </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Result panel */}
        <div>
          {!result && !loading && (
            <div className="card h-full flex flex-col items-center justify-center
              text-center py-16 border-2 border-dashed border-gray-200">
              <span className="text-5xl mb-4">🧬</span>
              <p className="text-gray-500 font-medium">AI Analysis Result</p>
              <p className="text-gray-400 text-sm mt-2">
                Fill out the form on the left and click "Analyze Symptoms"
              </p>
            </div>
          )}

          {loading && (
            <div className="card h-full flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full"/>
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent
                  rounded-full animate-spin absolute top-0 left-0"/>
              </div>
              <p className="text-gray-600 font-medium mt-6">AI is analyzing...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we analyze your symptoms</p>
            </div>
          )}

          {result && risk && (
            <div className={`card border-2 ${risk.border} ${risk.bg} space-y-5`}>

              {/* Risk level */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">AI Analysis Result</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${risk.badge}`}>
                    {result.riskLevel} risk
                  </span>
                  <span className="text-lg">
                    {URGENCY_ICONS[result.urgency] || '🟢'}
                  </span>
                </div>
              </div>

              {/* Urgency */}
              <div className="p-3 bg-white rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Urgency Level
                </p>
                <p className={`font-semibold capitalize ${risk.text}`}>
                  {URGENCY_ICONS[result.urgency]} {result.urgency}
                </p>
              </div>

              {/* Possible conditions */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Possible Conditions
                </p>
                <div className="space-y-2">
                  {result.possibleConditions?.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5
                      bg-white rounded-lg text-sm text-gray-800">
                      <span className="w-5 h-5 bg-purple-100 text-purple-700
                        rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested tests */}
              {result.suggestedTests?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Suggested Tests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedTests.map((t, i) => (
                      <span key={i} className="text-xs bg-white text-gray-700
                        px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                        🧪 {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice */}
              {result.advice && (
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Doctor Advice
                  </p>
                  <p className="text-sm text-gray-800">{result.advice}</p>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                * This is an AI-generated analysis. Clinical confirmation is essential.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}