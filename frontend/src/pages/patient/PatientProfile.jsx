import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail';

export default function PatientProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [viewPrescription, setViewPrescription] = useState(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        contact: '',
        age: '',
        gender: '',
        address: '',
        bloodGroup: '',
    });

    useEffect(() => {
        fetchProfile();
        fetchAppointments();
        fetchPrescriptions();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/patients/profile/me');
            // data.user  → user info
            // data.patient → patient record
            setProfile(data);
            setForm({
                name: data.user?.name || '',
                email: data.user?.email || '',
                contact: data.patient?.contact || '',
                age: data.patient?.age || '',
                gender: data.patient?.gender || '',
                address: data.patient?.address || '',
                bloodGroup: data.patient?.bloodGroup || '',
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/patients/my-appointments');
            setAppointments(data.appointments);
        } catch (err) {
            toast.error('Failed to load appointments');
        }
    };

    const fetchPrescriptions = async () => {
        try {
            const { data } = await api.get('/patients/my-prescriptions');
            setPrescriptions(data.prescriptions);
        } catch (err) {
            toast.error('Failed to load prescriptions');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/patients/profile', form);
            toast.success('Profile updated successfully');
            setEditing(false);
            fetchProfile();
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (prescriptionId) => {
        try {
            const res = await api.get(`/prescriptions/${prescriptionId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Downloading PDF...');
        } catch {
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl">
                    👤
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View and update your information
                    </p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    {!editing && (
                        <button onClick={() => setEditing(true)} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {!editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="font-medium text-gray-900">{profile?.user?.name}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{profile?.user?.email}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Contact</p>
                            <p className="font-medium text-gray-900">{profile?.patient?.contact || '—'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Age / Gender</p>
                            <p className="font-medium text-gray-900">
                                {profile?.patient?.age || '—'} yrs / {profile?.patient?.gender || '—'}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Blood Group</p>
                            <p className="font-medium text-gray-900">{profile?.patient?.bloodGroup || '—'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">{profile?.patient?.address || '—'}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input name="email" type="email" value={form.email} disabled className="input-field bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                                <input name="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input name="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                <select name="bloodGroup" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea name="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
                            <button type="submit" disabled={loading} className="btn-primary">Save Changes</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Appointments History */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 My Appointments</h2>
                {appointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No appointments found</p>
                ) : (
                    <div className="space-y-3">
                        {appointments.map((apt) => (
                            <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Dr. {apt.doctorId?.name}</p>
                                    <p className="text-sm text-gray-500">{new Date(apt.date).toLocaleDateString()} · {apt.timeSlot}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                  ${apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {apt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Prescriptions History */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">💊 My Prescriptions</h2>
                {prescriptions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No prescriptions found</p>
                ) : (
                    <div className="space-y-3">
                        {prescriptions.map((rx) => (
                            <div key={rx._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setViewPrescription(rx)}>
                                <div>
                                    <p className="font-medium text-gray-900">{rx.diagnosis}</p>
                                    <p className="text-sm text-gray-500">Dr. {rx.doctorId?.name} · {new Date(rx.createdAt).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-400 mt-1">{rx.medicines.length} medicines</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(rx._id); }}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    📥 PDF
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Prescription Detail Modal */}
            {viewPrescription && (
                <PrescriptionDetail
                    prescription={viewPrescription}
                    onClose={() => setViewPrescription(null)}
                />
            )}
        </div>
    );
}