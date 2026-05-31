import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const StatCard = ({ title, value, icon, color, sub }) => (
  <div className="card flex items-start gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <span className="text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? 0}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]             = useState(null);
  const [todayAppts, setTodayAppts]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [apptLoading, setApptLoading] = useState(false);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'];

  useEffect(() => {
  // Patient aur receptionist ke liye koi API call nahi
  if (user.role === 'patient' || user.role === 'receptionist') {
    setLoading(false);
    return;
  }

  const endpoint = user.role === 'admin'
    ? '/analytics/admin'
    : '/analytics/doctor';

  api.get(endpoint)
    .then(({ data }) => setStats(data.stats))
    .catch(() => toast.error('Stats load nahi hui'))
    .finally(() => setLoading(false));

  if (user.role === 'doctor') {
    fetchTodayAppointments();
  }
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
        const filtered = (data.appointments || []).filter(a =>
          new Date(a.date).toDateString() === todayStr
        );
        setTodayAppts(filtered);
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
      toast.success(`Status updated: ${status}`);
      fetchTodayAppointments();
      api.get('/analytics/doctor').then(({ data }) => setStats(data.stats));
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/>
    </div>
  );

  const chartData = stats?.monthlyAppointments?.map(m => ({
    month: monthNames[m._id - 1],
    appointments: m.count,
  })) || [];

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{todayDate}</p>
      </div>

      {/* ── ADMIN VIEW ── */}
      {user.role === 'admin' && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon="👥"
              color="bg-blue-50"
              sub="Registered patients"
            />
            <StatCard
              title="Total Doctors"
              value={stats.totalDoctors}
              icon="👨‍⚕️"
              color="bg-green-50"
              sub="Active doctors"
            />
            <StatCard
              title="Total Appointments"
              value={stats.totalAppointments}
              icon="📅"
              color="bg-purple-50"
              sub="All time"
            />
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
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Monthly Appointments
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }}/>
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }}/>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}/>
                  <Area type="monotone" dataKey="appointments" stroke="#2563eb" strokeWidth={2.5} fill="url(#grad)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* ── DOCTOR VIEW ── */}
      {user.role === 'doctor' && stats && (
        <>
          {/* 3 Stat boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Today's Appointments"
              value={stats.todayCount}
              icon="📅"
              color="bg-blue-50"
              sub="Today"
            />
            <StatCard
              title="This Month"
              value={stats.monthCount}
              icon="📆"
              color="bg-green-50"
              sub="This month"
            />
            <StatCard
              title="Total Prescriptions"
              value={stats.prescriptionCount}
              icon="💊"
              color="bg-purple-50"
              sub="Written by you"
            />
          </div>

          {/* Today's Appointments List */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  📋 Today's Appointments
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{todayDate}</p>
              </div>
              <span className="bg-primary-100 text-primary-700 text-sm
                font-semibold px-3 py-1 rounded-full">
                {todayAppts.length} total
              </span>
            </div>

            {apptLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"/>
              </div>

            ) : todayAppts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <span className="text-5xl">🗓️</span>
                <p className="text-gray-600 font-medium mt-3">
                  No appointments today
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Appointments will appear here when booked
                </p>
              </div>

            ) : (
              <div className="space-y-3">
                {todayAppts.map((appt, index) => (
                  <div key={appt._id}
                    className="flex items-center gap-4 p-4 bg-gray-50
                      rounded-xl hover:bg-gray-100 transition-colors">

                    {/* Number */}
                    <div className="w-8 h-8 bg-primary-100 text-primary-700
                      rounded-lg flex items-center justify-center text-sm
                      font-bold shrink-0">
                      {index + 1}
                    </div>

                    {/* Time */}
                    <div className="w-24 shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {appt.timeSlot}
                      </p>
                      <p className="text-xs text-gray-400">Time slot</p>
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {appt.patientId?.name || 'Unknown Patient'}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-500">
                          {appt.patientId?.age} yrs · {appt.patientId?.gender}
                        </p>
                        {appt.patientId?.contact && (
                          <p className="text-xs text-gray-400">
                            📞 {appt.patientId.contact}
                          </p>
                        )}
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic truncate">
                          Note: {appt.notes}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      capitalize shrink-0 ${STATUS_STYLES[appt.status]}`}>
                      {appt.status}
                    </span>

                    {/* Action buttons */}
                    <div className="flex gap-2 shrink-0">
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(appt._id, 'confirmed')}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white
                            px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(appt._id, 'completed')}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white
                            px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Complete
                        </button>
                      )}
                      {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600
                            px-3 py-1.5 rounded-lg font-medium transition-colors">
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
        <div className="card text-center py-12">
          <span className="text-5xl">🏥</span>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            Welcome to MediCare
          </h2>
          <p className="text-gray-500 mt-2">
            Select an option from the sidebar to get started
          </p>
        </div>
      )}

    </div>
  );
}