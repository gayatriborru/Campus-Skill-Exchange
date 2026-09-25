import React, { useState } from 'react';
import Modal from '../common/Modal';
import StarRating from '../common/StarRating';
import { ratingService } from '../../services/ratingService';
import { useToast } from '../../context/ToastContext';
import { Award, Sparkles, MessageSquare } from 'lucide-react';

const ReviewSessionModal = ({ isOpen, onClose, session, onReviewSubmitted }) => {
  const { toastSuccess, toastError, toastBadge } = useToast();

  const [skillKnowledge, setSkillKnowledge] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [helpfulness, setHelpfulness] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!session) return null;

  const teacherName = session.teacher?.name || 'Mentor';
  const skillName = session.skill?.name || 'Skill';

  const averageScore = (
    (Number(skillKnowledge) + Number(communication) + Number(helpfulness)) /
    3
  ).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const res = await ratingService.createRating({
        sessionId: session._id,
        skillKnowledge,
        communication,
        helpfulness,
        feedback: feedback.trim(),
      });

      toastSuccess(
        `Thank you! You gave ${teacherName} a ${averageScore}★ rating. +10 Skill Points awarded!`,
        'Review Submitted'
      );

      if (res.newBadges?.length > 0) {
        res.newBadges.forEach((b) => toastBadge(b.name, b.description));
      }

      window.dispatchEvent(
        new CustomEvent('campus:rating:submitted', {
          detail: {
            teacherId: session.teacher?._id || session.teacher,
            teacherAverageRating: res.teacherAverageRating,
            teacherRatingsCount: res.teacherRatingsCount,
          },
        })
      );

      onReviewSubmitted && onReviewSubmitted(res);
      onClose();
    } catch (err) {
      toastError(err.customMessage || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate & Review Skill Session"
      subtitle={`Mentorship by ${teacherName} in ${skillName}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Overall Score Banner */}
        <div className="flex items-center justify-between p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Overall Rating</p>
              <p className="text-[11px] text-slate-500">Calculated from 3 categories</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600 tracking-tight">{averageScore}</span>
            <span className="text-xs text-slate-400 font-semibold"> / 5.0</span>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Skill Knowledge</p>
              <p className="text-[10px] text-slate-400">Mastery and depth of subject</p>
            </div>
            <StarRating
              rating={skillKnowledge}
              interactive
              onChange={setSkillKnowledge}
              size="lg"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <div>
              <p className="text-xs font-semibold text-slate-800">Communication</p>
              <p className="text-[10px] text-slate-400">Patience, clarity & listening</p>
            </div>
            <StarRating
              rating={communication}
              interactive
              onChange={setCommunication}
              size="lg"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <div>
              <p className="text-xs font-semibold text-slate-800">Helpfulness</p>
              <p className="text-[10px] text-slate-400">Actionable advice & hands-on support</p>
            </div>
            <StarRating
              rating={helpfulness}
              interactive
              onChange={setHelpfulness}
              size="lg"
            />
          </div>
        </div>

        {/* Written Feedback */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
            Written Feedback for {teacherName}
          </label>
          <textarea
            required
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`How did ${teacherName} help you learn? What was the best takeaway?`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>+10 pts for rating peer</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !feedback.trim()}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewSessionModal;
