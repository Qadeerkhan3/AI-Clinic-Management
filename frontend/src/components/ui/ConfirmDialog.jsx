import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog — A beautiful, accessible confirmation modal
 *
 * Props:
 *   isOpen      {boolean}  — Whether the dialog is visible
 *   title       {string}   — Modal title (e.g., "Delete Patient")
 *   message     {string}   — Description or warning text
 *   confirmText {string}   — Label for the action button (default: "Confirm")
 *   cancelText  {string}   — Label for the close button (default: "Cancel")
 *   onConfirm   {function} — Callback when confirmed
 *   onCancel    {function} — Callback when cancelled/dismissed
 *   type        {string}   — "danger" (red buttons) or "primary" (blue buttons) (default: "danger")
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onCancel} />

      {/* Dialog container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden z-10 animate-zoom-in">
        {/* Header */}
        <div className="p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isDanger ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-6">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
