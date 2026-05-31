const bloodColors = {
  'A+': 'bg-red-100 text-red-700',
  'A-': 'bg-red-100 text-red-700',
  'B+': 'bg-blue-100 text-blue-700',
  'B-': 'bg-blue-100 text-blue-700',
  'O+': 'bg-green-100 text-green-700',
  'O-': 'bg-green-100 text-green-700',
  'AB+': 'bg-purple-100 text-purple-700',
  'AB-': 'bg-purple-100 text-purple-700',
};

export default function PatientCard({ patient, onEdit, onDelete, canEdit }) {
  return (
    <div className="card hover:shadow-md transition-shadow group">

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary-100 text-primary-700 rounded-xl
            flex items-center justify-center text-lg font-bold">
            {patient.name[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-xs text-gray-500 capitalize">
              {patient.gender} · {patient.age} yrs
            </p>
          </div>
        </div>
        {patient.bloodGroup && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${bloodColors[patient.bloodGroup] || 'bg-gray-100 text-gray-600'}`}>
            {patient.bloodGroup}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>📞</span>
          <span>{patient.contact}</span>
        </div>
        {patient.email && (
          <div className="flex items-center gap-2">
            <span>✉️</span>
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        {patient.address && (
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="truncate">{patient.address}</span>
          </div>
        )}
      </div>

      {/* Date */}
      <p className="text-xs text-gray-400 mt-4">
        Registered: {new Date(patient.createdAt).toLocaleDateString('en-PK')}
      </p>

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(patient)}
            className="flex-1 text-sm text-primary-600 hover:bg-primary-50
              font-medium py-2 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(patient._id)}
            className="flex-1 text-sm text-red-600 hover:bg-red-50
              font-medium py-2 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}