/**
 * StatCard — shared stat display card
 *
 * Props:
 *   title    {string}  — label above the number
 *   value    {any}     — the big number / value
 *   icon     {string}  — emoji OR React node
 *   color    {string}  — Tailwind bg class for icon container  e.g. "bg-blue-50"
 *   iconColor {string} — Tailwind text class for emoji          e.g. "text-blue-600"
 *   sub      {string}  — small subtext below the value
 */
export default function StatCard({ title, value, icon, color = 'bg-blue-50', iconColor = 'text-blue-600', sub }) {
  return (
    <div className="card flex items-start gap-4 animate-fade-in">
      <div className={`p-3 rounded-xl shrink-0 ${color}`}>
        <span className={`text-2xl ${iconColor}`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-0.5 tabular-nums">{value ?? 0}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
