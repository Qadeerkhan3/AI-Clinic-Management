import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Activity, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin,  setIsLogin]  = useState(true);
  const [showPwd,  setShowPwd]  = useState(false);
  const [form,     setForm]     = useState({ name: '', email: '', password: '', role: 'patient' });
  const [loading,  setLoading]  = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/dashboard');
      } else {
        await api.post('/auth/register', {
          name:     form.name,
          email:    form.email,
          password: form.password,
          role:     form.role,
        });
        toast.success('Account created! Please sign in.');
        setIsLogin(true);
        setForm({ name: '', email: '', password: '', role: 'patient' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: '', email: '', password: '', role: 'patient' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-primary-700 flex items-center justify-center p-4">

      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MediCare</h1>
            <p className="text-gray-500 text-sm mt-1">AI-Powered Clinic Management</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setForm({ name: '', email: '', password: '', role: 'patient' }); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setForm({ name: '', email: '', password: '', role: 'patient' }); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name — register only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="input-field"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role — register only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Register as *</label>
                <select name="role" value={form.role} onChange={handleChange} className="input-field">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  Admin accounts can only be created by existing admins.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? 'Please wait...'
                : isLogin ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          {/* Demo credentials */}
          {isLogin && (
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Demo Accounts</p>
              <div className="space-y-1">
                {[
                  { role: 'Admin',        cred: 'admin@clinic.com / admin123' },
                  { role: 'Doctor',       cred: 'doctor@clinic.com / doctor123' },
                  { role: 'Receptionist', cred: 'reception@clinic.com / rec123' },
                ].map(({ role, cred }) => (
                  <div key={role} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700 w-20 shrink-0">{role}:</span>
                    <span className="text-gray-500">{cred}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/50 mt-6">
          © {new Date().getFullYear()} MediCare. All rights reserved.
        </p>
      </div>
    </div>
  );
}