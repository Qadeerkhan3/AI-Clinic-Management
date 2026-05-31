import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, FileText,
  Bot, BarChart2, UserCog, UserCheck, User, X,
  Activity,
} from 'lucide-react';

const allLinks = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
  {
    to: '/patients',
    label: 'Patients',
    Icon: Users,
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    to: '/appointments',
    label: 'Appointments',
    Icon: Calendar,
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
  {
    to: '/prescriptions',
    label: 'Prescriptions',
    Icon: FileText,
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    to: '/ai-assistant',
    label: 'AI Assistant',
    Icon: Bot,
    roles: ['doctor'],
  },
  {
    to: '/analytics',
    label: 'Analytics',
    Icon: BarChart2,
    roles: ['admin', 'doctor'],
  },
  {
    to: '/admin/doctors',
    label: 'Doctors',
    Icon: UserCog,
    roles: ['admin'],
  },
  {
    to: '/admin/receptionists',
    label: 'Receptionists',
    Icon: UserCheck,
    roles: ['admin'],
  },
  {
    to: '/patient/profile',
    label: 'My Profile',
    Icon: User,
    roles: ['patient'],
  },
];

const ROLE_COLORS = {
  admin:        { bg: 'bg-purple-500', label: 'bg-purple-100 text-purple-700' },
  doctor:       { bg: 'bg-emerald-500', label: 'bg-emerald-100 text-emerald-700' },
  receptionist: { bg: 'bg-amber-500',  label: 'bg-amber-100 text-amber-700' },
  patient:      { bg: 'bg-blue-500',   label: 'bg-blue-100 text-blue-700' },
};

export default function Sidebar({ onClose, isDesktop }) {
  const { user } = useAuth();
  const links    = allLinks.filter(l => l.roles.includes(user?.role));
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.patient;

  return (
    <aside className="w-64 h-full bg-gray-900 text-white flex flex-col shadow-xl">

      {/* Brand header */}
      <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-none">MediCare</h2>
            <p className="text-xs text-gray-400 mt-0.5">Clinic Management</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {!isDesktop && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-gray-700/30">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleStyle.label}`}>
          {user?.role} Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => { if (!isDesktop) onClose(); }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
               ${isActive
                 ? 'bg-primary-600 text-white shadow-sm'
                 : 'text-gray-400 hover:bg-gray-800 hover:text-white'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${roleStyle.bg} rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}