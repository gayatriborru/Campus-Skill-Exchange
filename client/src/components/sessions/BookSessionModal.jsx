import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { sessionService } from '../../services/sessionService';
import { skillService } from '../../services/skillService';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Video, BookOpen, User } from 'lucide-react';

const BookSessionModal = ({
  isOpen,
  onClose,
  initialTeacher = null,
  initialSkill = null,
  onSessionCreated,
}) => {
  const { toastSuccess, toastError } = useToast();

  const [teacher, setTeacher] = useState(initialTeacher);
  const [skillId, setSkillId] = useState(initialSkill?._id || '');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [topic, setTopic] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/new');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTeacher) {
      setTeacher(initialTeacher);
    }
    if (initialSkill) {
      setSkillId(initialSkill._id || initialSkill);
      if (initialSkill.name) {
        setTopic(`1:1 Deep Dive: ${initialSkill.name}`);
      }
    }
  }, [initialTeacher, initialSkill]);

  useEffect(() => {
    if (isOpen) {
      const fetchSkills = async () => {
        try {
          const skills = await skillService.getSkills();
          setAvailableSkills(skills || []);
          if (!skillId && skills?.length > 0) {
            setSkillId(skills[0]._id);
            setTopic(`1:1 Mentorship in ${skills[0].name}`);
          }
        } catch (err) {
          console.error('Error fetching skills:', err);
        }
      };
      fetchSkills();

      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen, skillId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacher?._id) {
      toastError('Please select a mentor/teacher for this session.');
      return;
    }
    if (!skillId) {
      toastError('Please specify the skill for this session.');
      return;
    }

    try {
      setLoading(true);
      const session = await sessionService.createSession({
        teacher: teacher._id,
        skill: skillId,
        date,
        startTime,
        endTime,
        topic: topic.trim() || 'Skill Exchange Session',
        meetingLink: meetingLink.trim(),
        notes: notes.trim(),
      });

      toastSuccess(
        `Session invitation sent to ${teacher.name}! You will be notified once they accept.`,
        'Exchange Requested'
      );
      onSessionCreated && onSessionCreated(session);
      onClose();
    } catch (err) {
      toastError(err.customMessage || 'Failed to schedule session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Skill Exchange Session"
      subtitle={
        teacher
          ? `Booking mentorship with ${teacher.name} (${teacher.department || 'Student'})`
          : 'Propose a 1-on-1 collaborative study session'
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {teacher && (
          <div className="flex items-center gap-3 p-3 bg-brand-50/60 border border-brand-100 rounded-xl">
            <img
              src={
                teacher.profileImage ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(teacher.name)}`
              }
              alt={teacher.name}
              className="w-10 h-10 rounded-full object-cover border border-brand-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">{teacher.name}</p>
              <p className="text-[11px] text-slate-500">{teacher.department} • {teacher.year}</p>
            </div>
            <div className="text-right text-[11px] font-semibold text-brand-700 bg-white px-2.5 py-1 rounded-lg border border-brand-200">
              ★ {Number(teacher.averageRating || 5).toFixed(1)}
            </div>
          </div>
        )}

        {/* Skill Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            Skill to Exchange / Learn
          </label>
          <select
            value={skillId}
            onChange={(e) => {
              setSkillId(e.target.value);
              const found = availableSkills.find((s) => s._id === e.target.value);
              if (found) {
                setTopic(`1:1 Mentorship: ${found.name}`);
              }
            }}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm bg-white"
          >
            {availableSkills.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Topic / Agenda */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Session Focus / Agenda
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Debugging Python lists, reviewing portfolio UI..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Meeting Link / Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-slate-500" />
            Meeting Link or Campus Location
          </label>
          <input
            type="text"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="e.g. https://meet.google.com/xyz or Library Room 3B"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
          />
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Note for Mentor (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share any questions or prep work before the session..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Sending Request...' : 'Send Session Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookSessionModal;
