import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const allLinks = [
  { to: '/dashboard',     label: 'Dashboard',     icon: '🏠', roles: ['admin','doctor','receptionist','patient'] },
  { to: '/patients',      label: 'Patients',       icon: '👥', roles: ['admin','doctor','receptionist'] },
  { to: '/appointments',  label: 'Appointments',   icon: '📅', roles: ['admin','doctor','receptionist','patient'] },
  { to: '/prescriptions', label: 'Prescriptions',  icon: '💊', roles: ['admin','doctor','patient'] },
  { to: '/ai-assistant',  label: 'AI Assistant',   icon: '🤖', roles: ['doctor'] },
  { to: '/analytics',     label: 'Analytics',      icon: '📊', roles: ['admin','doctor'] },
  { to: '/admin/doctors', label: 'Doctors', icon: '👨‍⚕️', roles: ['admin'] },
  { to: '/admin/receptionists', label: 'Receptionists', icon: '👩‍💼', roles: ['admin'] },
  { to: '/patient/profile', label: 'My Profile', icon: '👤', roles: ['patient'] },
];

export default function Sidebar({ isOpen }) {
  const { user } = useAuth();

  const links = allLinks.filter(l => l.roles.includes(user?.role));

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0 overflow-hidden'} 
      transition-all duration-300 bg-primary-900 text-white flex flex-col`}>

      {/* Brand */}
      <div className="p-6 border-b border-primary-700">
        <h2 className="text-xl font-bold">MediCare</h2>
        <p className="text-primary-300 text-xs mt-1 capitalize">{user?.role} Panel</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
               ${isActive
                 ? 'bg-white text-primary-900'
                 : 'text-primary-200 hover:bg-primary-800 hover:text-white'}`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-primary-300 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}