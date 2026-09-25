import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { matchService } from '../services/matchService';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import SkillTag from '../components/common/SkillTag';
import BookSessionModal from '../components/sessions/BookSessionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getUserAvatar } from '../utils/avatarUtils';
import {
  Repeat,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  MessageSquare,
  SlidersHorizontal,
  Info,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Data Science & AI',
  'Design & Media',
  'Business Administration',
];

const MatchmakerPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState('All');
  const [minRating, setMinRating] = useState('');

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await matchService.getMatches({
          department: department !== 'All' ? department : undefined,
          minRating: minRating || undefined,
          includeAll: true,
        });
        setMatches(data || []);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.customMessage || 'Failed to load matches. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [isAuthenticated, department, minRating]);

  const handleProposeSwap = (matchItem) => {
    setSelectedStudent(matchItem.student);
    // Preselect a skill they can teach me if available
    const skillObj = matchItem.theyCanTeachMe?.[0]?.skill || null;
    setSelectedSkill(skillObj);
    setBookingModalOpen(true);
  };

  const handleStartChat = (studentId) => {
    navigate(`/messages?recipient=${studentId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold mb-3">
            <Repeat className="w-3.5 h-3.5" />
            <span>Algorithmic Skill Reciprocity Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Smart Campus Matchmaker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            We pair your teaching competencies with fellow students who want to learn them, and align their skills with what you wish to master.
          </p>
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              fetchMatches();
            }}
            className="font-bold underline hover:no-underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Match Filters:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ ★ Minimum</option>
            <option value="4.8">4.8+ ★ Minimum</option>
          </select>
        </div>
      </motion.div>

      {/* Matches Grid */}
      {loading ? (
        <LoadingSpinner text="Computing reciprocal compatibility scores..." />
      ) : matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8"
        >
          <Repeat className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-spin-slow" />
          <h3 className="text-base font-bold text-slate-800">No matching peers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try expanding your skills to teach and learn in your profile, or loosen your department filter.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((item, index) => {
            const isMutual = !!item.isMutualMatch;
            const score = Number(item.matchPercentage || 0);

            return (
              <motion.div
                key={item.student._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={`bg-white rounded-2xl border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between card-hover-lift overflow-hidden ${
                  isMutual
                    ? 'border-brand-300 ring-2 ring-brand-500/10'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top: Match Badge & Student info */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <img
                        src={getUserAvatar(item.student)}
                        alt={item.student.name}
                        className="w-13 h-13 rounded-full object-cover border-2 border-brand-200 flex-shrink-0 transition-transform hover:scale-105 duration-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {item.student.name}
                          </h3>
                          {isMutual && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Mutual Swap
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {item.student.department} • {item.student.year}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 max-w-full">
                          {item.student.ratingsCount > 0 ? (
                            <StarRating rating={item.student.averageRating} ratingsCount={item.student.ratingsCount} size="xs" showValue />
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                              No ratings yet
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            • Availability: {item.student.availability || 'Flexible'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Percentage Ring */}
                    <div className="text-center flex-shrink-0">
                      <div
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-transform hover:scale-105 duration-200 ${
                          score >= 80
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : score >= 50
                            ? 'bg-brand-50 text-brand-700 border border-brand-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span className="text-base leading-none">{score}%</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
                          Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                    {item.student.bio}
                  </p>

                  {/* Reciprocal Breakdown Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 mb-4">
                    {/* They Teach You */}
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        They can teach you:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.theyCanTeachMe?.length > 0 ? (
                          item.theyCanTeachMe.map((s, idx) => (
                            <SkillTag
                              key={idx}
                              skill={s.skill?.name || 'Skill'}
                              type="teach"
                              size="sm"
                            />
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Explore their profile skills
                          </span>
                        )}
                      </div>
                    </div>

                    {/* You Teach Them */}
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-brand-700 mb-1 flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" />
                        You can teach them:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.iCanTeachThem?.length > 0 ? (
                          item.iCanTeachThem.map((s, idx) => (
                            <SkillTag
                              key={idx}
                              skill={s.skill?.name || 'Skill'}
                              type="learn"
                              size="sm"
                            />
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Open collaboration
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom action buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleProposeSwap(item)}
                    className="btn-press flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    Propose Skill Swap
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => handleStartChat(item.student._id)}
                    className="btn-press p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                    title="Chat with student"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => navigate(`/profile/${item.student._id}`)}
                    className="btn-press px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Booking Session Modal */}
      {selectedStudent && (
        <BookSessionModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          initialTeacher={selectedStudent}
          initialSkill={selectedSkill}
        />
      )}
    </div>
  );
};

export default MatchmakerPage;
