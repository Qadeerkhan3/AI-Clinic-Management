import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Menu, LogOut, Bell } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':           'Dashboard',
  '/patients':            'Patients',
  '/appointments':        'Appointments',
  '/prescriptions':       'Prescriptions',
  '/ai-assistant':        'AI Assistant',
  '/analytics':           'Analytics',
  '/admin/doctors':       'Manage Doctors',
  '/admin/receptionists': 'Manage Receptionists',
  '/patient/profile':     'My Profile',
};

const ROLE_COLORS = {
  admin:        'bg-purple-100 text-purple-700',
  doctor:       'bg-emerald-100 text-emerald-700',
  receptionist: 'bg-amber-100 text-amber-700',
  patient:      'bg-blue-100 text-blue-700',
};

export default function Navbar({ onToggle }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'MediCare';
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.patient;

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out.');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-10">

      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          id="sidebar-toggle"
          aria-label="Toggle sidebar"
          className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-none">{pageTitle}</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Right: role badge + user info + logout */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Role badge — hidden on very small screens */}
        <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleStyle}`}>
          {user?.role}
        </span>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[120px] truncate">
            {user?.name}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          id="logout-btn"
          aria-label="Logout"
          className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium
                     px-3 py-1.5 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}