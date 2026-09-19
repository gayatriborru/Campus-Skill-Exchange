import React, { useState } from 'react';
import Modal from './Modal';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

const ReportUserModal = ({ isOpen, onClose, targetUser, onReported }) => {
  const { toastSuccess, toastError } = useToast();
  const [reason, setReason] = useState('Inappropriate Behavior');
  const [description, setDescription] = useState('');
  const [blockUser, setBlockUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUser?._id) return;

    try {
      setSubmitting(true);
      await reportService.createReport({
        reportedUser: targetUser._id,
        reason,
        description,
      });

      if (blockUser) {
        await reportService.toggleBlockUser(targetUser._id);
      }

      toastSuccess(
        'Thank you for helping keep the campus skill exchange safe. Our moderation team has been notified.',
        'Report Submitted'
      );
      onReported && onReported();
      onClose();
    } catch (err) {
      toastError(err.customMessage || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Student / Safety Concern"
      subtitle={`Flagging profile: ${targetUser?.name || 'Student'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            SkillVerse is built on trust and peer collaboration. False reports will be reviewed by campus moderators.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Report
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
          >
            <option value="Inappropriate Behavior">Inappropriate or offensive behavior</option>
            <option value="No-Show / Unreliable">Repeated session no-show / ghosting</option>
            <option value="Misleading Skills">Falsified skill credentials or spam</option>
            <option value="Commercial Solicitation">Demanding cash instead of skill points</option>
            <option value="Other">Other safety concern</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Incident Details (Required)
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details about what occurred during the exchange or chat..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="blockCheckbox"
            checked={blockUser}
            onChange={(e) => setBlockUser(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
          />
          <label htmlFor="blockCheckbox" className="text-xs text-slate-700 font-medium">
            Also block {targetUser?.name || 'this student'} from contacting or matching with me
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportUserModal;
