import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS     = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatBox = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-xl text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
);

export default function Analytics() {
  const { user }          = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = user.role === 'admin' ? '/analytics/admin' : '/analytics/doctor';
    api.get(url)
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error('Analytics load nahi hui'))
      .finally(() => setLoading(false));
  }, [user.role]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/>
    </div>
  );

  // Chart data
  const monthlyData = stats?.monthlyAppointments?.map(m => ({
    month: MONTH_NAMES[m._id - 1],
    appointments: m.count,
  })) || [];

  // Simulated data for richer charts
  const statusData = [
    { name: 'Completed', value: 58 },
    { name: 'Confirmed', value: 22 },
    { name: 'Pending',   value: 12 },
    { name: 'Cancelled', value: 8  },
  ];

  const weeklyData = [
    { day: 'Mon', patients: 12 },
    { day: 'Tue', patients: 19 },
    { day: 'Wed', patients: 8  },
    { day: 'Thu', patients: 24 },
    { day: 'Fri', patients: 17 },
    { day: 'Sat', patients: 9  },
    { day: 'Sun', patients: 3  },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user.role === 'admin' ? 'System-wide overview' : 'Aapki personal stats'}
        </p>
      </div>

      {/* ── ADMIN VIEW ── */}
      {user.role === 'admin' && stats && (
        <>
          {/* Stat boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox label="Total Patients"      value={stats.totalPatients}      icon="👥" color="bg-blue-50"/>
            <StatBox label="Total Doctors"       value={stats.totalDoctors}       icon="👨‍⚕️" color="bg-green-50"/>
            <StatBox label="Total Appointments"  value={stats.totalAppointments}  icon="📅" color="bg-purple-50"/>
            <StatBox label="Active Plan"         value="Pro"                      icon="⭐" color="bg-amber-50"/>
          </div>

          {/* Monthly area chart */}
          {monthlyData.length > 0 && (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-800 mb-5">
                Monthly Appointments Trend
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gradAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }}/>
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }}/>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px', border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Area
                    type="monotone" dataKey="appointments"
                    stroke="#2563eb" strokeWidth={2.5}
                    fill="url(#gradAppt)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Two charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Weekly bar chart */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-800 mb-5">
                Weekly Patient Load
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }}/>
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }}/>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px', border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Bar dataKey="patients" fill="#2563eb" radius={[6, 6, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-800 mb-5">
                Appointment Status Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px', border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SaaS subscription simulation */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Subscription Plans
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Free plan */}
              <div className="p-5 border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Free Plan</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                    Current
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  Rs. 0<span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {['Up to 50 patients','Basic appointments','Basic prescriptions','No AI features'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className={f.includes('No') ? 'text-red-400' : 'text-green-500'}>
                        {f.includes('No') ? '✕' : '✓'}
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro plan */}
              <div className="p-5 border-2 border-primary-500 rounded-xl bg-primary-50 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full font-medium">
                    Recommended
                  </span>
                </div>
                <h3 className="font-semibold text-primary-900 mb-3">Pro Plan</h3>
                <p className="text-3xl font-bold text-primary-900 mb-4">
                  Rs. 2,999<span className="text-sm font-normal text-primary-600">/mo</span>
                </p>
                <ul className="space-y-2 text-sm text-primary-800">
                  {[
                    'Unlimited patients',
                    'Advanced appointments',
                    'PDF prescriptions',
                    'AI symptom checker',
                    'AI prescription explain',
                    'Advanced analytics',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-primary-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="mt-4 w-full btn-primary py-2">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DOCTOR VIEW ── */}
      {user.role === 'doctor' && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatBox label="Aaj ki Appointments" value={stats.todayCount}        icon="📅" color="bg-blue-50"/>
            <StatBox label="Is Mahine"            value={stats.monthCount}        icon="📆" color="bg-green-50"/>
            <StatBox label="Total Prescriptions"  value={stats.prescriptionCount} icon="💊" color="bg-purple-50"/>
          </div>

          {/* Weekly bar chart for doctor */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-800 mb-5">
                Weekly Patient Load
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }}/>
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }}/>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px', border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                />
                <Bar dataKey="patients" fill="#10b981" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Doctor quick stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Completion Rate
              </h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-green-600">87%</span>
                <span className="text-sm text-gray-500 mb-1">appointments completed</span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '87%' }}/>
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Avg. Patients / Day
              </h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-primary-600">13</span>
                <span className="text-sm text-gray-500 mb-1">patients per day</span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: '65%' }}/>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}