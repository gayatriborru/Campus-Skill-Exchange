import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { badgeService } from '../services/badgeService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import BadgePill from '../components/common/BadgePill';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Trophy,
  Award,
  Flame,
  Coins,
  Medal,
  Sparkles,
  TrendingUp,
  User,
  GraduationCap,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';

const LeaderboardPage = () => {
  const { isAuthenticated } = useAuth();
  const [students, setStudents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState('points'); // 'points', 'sessions', 'rating'
  const navigate = useNavigate();
  const { toastError } = useToast();

  const fetchLeaderboardData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [studentsRes, badgesRes] = await Promise.all([
        userService.getUsers({ sortBy: metric, limit: 20 }),
        badgeService.getAllBadges(),
      ]);
      setStudents(studentsRes.students || []);
      setBadges(badgesRes || []);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      const errMsg = err.customMessage || 'Failed to load leaderboard data. Please check your connection and try again.';
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboardData();
    } else {
      setStudents([]);
      setBadges([]);
      setLoading(false);
    }
  }, [isAuthenticated, metric]);

  const top3 = students.slice(0, 3);
  const rest = students.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-4 hover:scale-105 transition-transform">
          <Trophy className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Campus Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Campus Skill Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Celebrating student mentors who generously dedicate time to lift and upskill peers
        </p>

        {/* Metric Selector */}
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-2xl mt-6">
          <button
            type="button"
            onClick={() => setMetric('points')}
            className={`px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all ${
              metric === 'points'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            By Skill Points 🪙
          </button>
          <button
            type="button"
            onClick={() => setMetric('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all ${
              metric === 'sessions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            By Sessions Exchanged 📅
          </button>
          <button
            type="button"
            onClick={() => setMetric('rating')}
            className={`px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all ${
              metric === 'rating'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            By Rating Score ★
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchLeaderboardData}
            className="font-bold underline hover:no-underline whitespace-nowrap active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Compiling leaderboard standings from MongoDB..." />
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No registered users yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete exchange sessions to earn skill points and climb the campus rankings.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 items-end">
              {/* Silver (2nd) */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  onClick={() => navigate(`/profile/${top3[1]._id}`)}
                  className="bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-sm hover:shadow-lg card-hover-lift transition-all cursor-pointer relative order-2 sm:order-1"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black text-sm flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 shadow-xs">
                    2
                  </div>
                  <img
                    src={
                      top3[1].profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        top3[1].name
                      )}`
                    }
                    alt=""
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-slate-200 hover:scale-105 transition-transform"
                  />
                  <h3 className="text-sm font-bold text-slate-900 truncate">{top3[1].name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{top3[1].department}</p>
                  <div className="mt-3 p-2 bg-slate-50 rounded-xl">
                    <span className="text-sm font-black text-slate-800">
                      {metric === 'points'
                        ? `${top3[1].skillPoints || 0} pts`
                        : metric === 'sessions'
                        ? `${top3[1].completedSessionsCount || 0} sessions`
                        : (top3[1].ratingsCount > 0 ? `★ ${Number(top3[1].averageRating).toFixed(1)}` : 'No ratings yet')}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Gold (1st) */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 28, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.02, ease: 'easeOut' }}
                  onClick={() => navigate(`/profile/${top3[0]._id}`)}
                  className="bg-gradient-to-b from-amber-50/90 to-white rounded-3xl border-2 border-amber-300 p-6 text-center shadow-lg hover:shadow-xl card-hover-lift transition-all cursor-pointer relative order-1 sm:order-2 sm:-translate-y-4"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-white font-black text-base flex items-center justify-center absolute -top-5 left-1/2 -translate-x-1/2 shadow-md shadow-amber-400/40 animate-bounce">
                    👑
                  </div>
                  <img
                    src={
                      top3[0].profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        top3[0].name
                      )}`
                    }
                    alt=""
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-amber-200 ring-2 ring-amber-400/50 hover:scale-105 transition-transform"
                  />
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {top3[0].name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{top3[0].department}</p>
                  <div className="mt-3 p-2.5 bg-amber-100/70 rounded-xl border border-amber-200">
                    <span className="text-base font-black text-amber-900">
                      {metric === 'points'
                        ? `${top3[0].skillPoints || 0} pts`
                        : metric === 'sessions'
                        ? `${top3[0].completedSessionsCount || 0} sessions`
                        : (top3[0].ratingsCount > 0 ? `★ ${Number(top3[0].averageRating).toFixed(1)}` : 'No ratings yet')}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Bronze (3rd) */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.18 }}
                  onClick={() => navigate(`/profile/${top3[2]._id}`)}
                  className="bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-sm hover:shadow-lg card-hover-lift transition-all cursor-pointer relative order-3"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-800 font-black text-sm flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 shadow-xs">
                    3
                  </div>
                  <img
                    src={
                      top3[2].profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        top3[2].name
                      )}`
                    }
                    alt=""
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-amber-700/20 hover:scale-105 transition-transform"
                  />
                  <h3 className="text-sm font-bold text-slate-900 truncate">{top3[2].name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{top3[2].department}</p>
                  <div className="mt-3 p-2 bg-slate-50 rounded-xl">
                    <span className="text-sm font-black text-slate-800">
                      {metric === 'points'
                        ? `${top3[2].skillPoints || 0} pts`
                        : metric === 'sessions'
                        ? `${top3[2].completedSessionsCount || 0} sessions`
                        : (top3[2].ratingsCount > 0 ? `★ ${Number(top3[2].averageRating).toFixed(1)}` : 'No ratings yet')}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Leaderboard Table (Ranks 4+) */}
          {rest.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Student Contributor
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Standing Score
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {rest.map((st, idx) => (
                  <div
                    key={st._id}
                    onClick={() => navigate(`/profile/${st._id}`)}
                    className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-black text-slate-400 w-6 text-center">
                        {idx + 4}
                      </span>
                      <img
                        src={
                          st.profileImage ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            st.name
                          )}`
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{st.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {st.department} • {st.year}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-slate-900 block">
                        {metric === 'points'
                          ? `${st.skillPoints || 0} pts`
                          : metric === 'sessions'
                          ? `${st.completedSessionsCount || 0} sessions`
                          : (st.ratingsCount > 0 ? `★ ${Number(st.averageRating).toFixed(1)}` : 'No ratings yet')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {st.completedSessionsCount || 0} sessions • {st.ratingsCount || 0} reviews
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Badges Unlock Guide (Data from MongoDB Badge Collection) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl"
      >
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-400">
            Gamification Guide
          </span>
          <h2 className="text-2xl font-bold mt-1">How to Earn Badges & Level Up</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Every knowledge exchange rewards both learner and teacher. Climb the ranks to become an official campus peer mentor!
          </p>
        </div>

        {badges.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No badges configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b._id || b.name}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-brand-500/50 hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                    {b.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{b.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;
