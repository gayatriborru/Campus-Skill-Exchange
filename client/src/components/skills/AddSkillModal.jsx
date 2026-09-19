import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { skillService } from '../../services/skillService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Plus, Sparkles, BookOpen, Layers } from 'lucide-react';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data & AI',
  'Design',
  'Media & Arts',
  'Communication',
  'Language',
  'Business',
  'Other',
];

const AddSkillModal = ({ isOpen, onClose, defaultType = 'teach', onSkillAdded }) => {
  const { toastSuccess, toastError, toastBadge } = useToast();

  const [type, setType] = useState(defaultType);
  const [mode, setMode] = useState('select'); // 'select' or 'custom'
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [customCategory, setCustomCategory] = useState('Programming');
  const [level, setLevel] = useState('Intermediate');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    if (isOpen) {
      const fetchSkills = async () => {
        try {
          const skills = await skillService.getSkills();
          setAvailableSkills(skills || []);
          if (skills?.length > 0) {
            setSelectedSkillId(skills[0]._id);
          }
        } catch (err) {
          console.error('Failed to load skills directory:', err);
        }
      };
      fetchSkills();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const payload = {
        type,
        level,
        notes: notes.trim(),
      };

      if (mode === 'select') {
        payload.skillId = selectedSkillId;
      } else {
        payload.skillName = customSkillName.trim();
        payload.category = customCategory;
      }

      const res = await userService.addStudentSkill(payload);
      toastSuccess(
        `Added to your "${type === 'teach' ? 'Skills I Can Teach' : 'Skills I Want to Learn'}" list!`,
        'Skill Registered'
      );

      if (res.newBadges?.length > 0) {
        res.newBadges.forEach((b) => toastBadge(b.name, b.description));
      }

      onSkillAdded && onSkillAdded();
      onClose();
    } catch (err) {
      toastError(err.customMessage || 'Failed to add skill.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Skill to Profile"
      subtitle="Expand your teaching portfolio or declare skills you wish to learn"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Teach vs Learn */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Skill Relationship
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('teach')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'teach'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              I Can Teach This
            </button>
            <button
              type="button"
              onClick={() => setType('learn')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'learn'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              I Want to Learn
            </button>
          </div>
        </div>

        {/* Mode Selector: Existing vs Custom */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-semibold text-slate-700">Skill Selection</span>
          <button
            type="button"
            onClick={() => setMode(mode === 'select' ? 'custom' : 'select')}
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            {mode === 'select' ? '+ Propose New Skill' : 'Pick from Directory'}
          </button>
        </div>

        {mode === 'select' ? (
          <div>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm bg-white"
            >
              {availableSkills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                required
                placeholder="Skill name (e.g. Flutter, Blender, Figma)..."
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Proficiency / Target Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            {type === 'teach' ? 'Your Proficiency Level' : 'Current Starting Level'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((lvl) => (
              <button
                type="button"
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                  level === lvl
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Brief Note / Focus Area (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              type === 'teach'
                ? 'e.g. 2 years experience building React apps'
                : 'e.g. Preparing for summer internship interviews'
            }
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || (mode === 'custom' && !customSkillName.trim())}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {submitting ? 'Adding...' : 'Add to Portfolio'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSkillModal;
