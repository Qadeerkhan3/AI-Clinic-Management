import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import StatCard from '../components/ui/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,       setStats]      = useState(null);
  const [todayAppts,  setTodayAppts] = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [apptLoading, setApptLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'patient' || user.role === 'receptionist') {
      setLoading(false);
      return;
    }

    const endpoint = user.role === 'admin' ? '/analytics/admin' : '/analytics/doctor';

    api.get(endpoint)
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error('Could not load statistics.'))
      .finally(() => setLoading(false));

    if (user.role === 'doctor') fetchTodayAppointments();
  }, [user.role]);

  const fetchTodayAppointments = async () => {
    setApptLoading(true);
    try {
      const { data } = await api.get('/appointments/schedule');
      setTodayAppts(data.schedule || []);
    } catch {
      try {
        const { data } = await api.get('/appointments');
        const todayStr = new Date().toDateString();
        setTodayAppts((data.appointments || []).filter(a =>
          new Date(a.date).toDateString() === todayStr
        ));
      } catch {
        setTodayAppts([]);
      }
    } finally {
      setApptLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchTodayAppointments();
      api.get('/analytics/doctor').then(({ data }) => setStats(data.stats));
    } catch {
      toast.error('Failed to update status.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner w-10 h-10" />
    </div>
  );

  const chartData = stats?.monthlyAppointments?.map(m => ({
    month: MONTH_NAMES[m._id - 1],
    appointments: m.count,
  })) || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{todayDate}</p>
      </div>

      {/* ── ADMIN VIEW ── */}
      {user.role === 'admin' && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Patients"      value={stats.totalPatients}     icon="👥" color="bg-blue-50"   sub="Registered patients" />
            <StatCard title="Total Doctors"       value={stats.totalDoctors}      icon="👨‍⚕️" color="bg-emerald-50" sub="Active doctors" />
            <StatCard title="Total Appointments"  value={stats.totalAppointments} icon="📅" color="bg-purple-50"  sub="All time" />
            <StatCard
              title="Subscription Plan"
              value={user.subscriptionPlan === 'pro' ? 'Pro ⭐' : 'Free'}
              icon="💳"
              color="bg-amber-50"
              sub={user.subscriptionPlan === 'pro' ? 'All features unlocked' : 'Upgrade for AI'}
            />
          </div>

          {chartData.length > 0 && (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Appointments</h2>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="appointments" stroke="#2563eb" strokeWidth={2.5} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* ── DOCTOR VIEW ── */}
      {user.role === 'doctor' && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Today's Appointments" value={stats.todayCount}        icon="📅" color="bg-blue-50"   sub="Today" />
            <StatCard title="This Month"            value={stats.monthCount}        icon="📆" color="bg-emerald-50" sub="This month" />
            <StatCard title="Total Prescriptions"  value={stats.prescriptionCount} icon="💊" color="bg-purple-50"  sub="Written by you" />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">📋 Today's Schedule</h2>
                <p className="text-sm text-gray-500 mt-0.5">{todayDate}</p>
              </div>
              <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
                {todayAppts.length} appointments
              </span>
            </div>

            {apptLoading ? (
              <div className="flex justify-center py-10"><div className="spinner w-8 h-8" /></div>
            ) : todayAppts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <span className="text-5xl">🗓️</span>
                <p className="text-gray-600 font-medium mt-3">No appointments today</p>
                <p className="text-gray-400 text-sm mt-1">Appointments will appear here when booked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppts.map((appt, index) => (
                  <div key={appt._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="w-24 shrink-0">
                      <p className="text-sm font-bold text-gray-900">{appt.timeSlot}</p>
                      <p className="text-xs text-gray-400">Time slot</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{appt.patientId?.name || 'Unknown Patient'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {appt.patientId?.age} yrs · {appt.patientId?.gender}
                        {appt.patientId?.contact && ` · 📞 ${appt.patientId.contact}`}
                      </p>
                      {appt.notes && <p className="text-xs text-gray-400 mt-1 italic truncate">Note: {appt.notes}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${STATUS_STYLES[appt.status]}`}>
                      {appt.status}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      {appt.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(appt._id, 'confirmed')}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button onClick={() => handleStatusUpdate(appt._id, 'completed')}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Complete
                        </button>
                      )}
                      {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PATIENT / RECEPTIONIST VIEW ── */}
      {(user.role === 'patient' || user.role === 'receptionist') && (
        <div className="card text-center py-16 animate-fade-in">
          <span className="text-6xl">🏥</span>
          <h2 className="text-xl font-semibold text-gray-800 mt-5">Welcome to MediCare</h2>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            Use the navigation sidebar to manage {user.role === 'patient' ? 'your appointments and prescriptions' : 'patients and appointments'}.
          </p>
        </div>
      )}
    </div>
  );
}