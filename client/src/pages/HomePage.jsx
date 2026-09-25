import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { skillService } from '../services/skillService';
import { userService } from '../services/userService';
import { analyticsService } from '../services/analyticsService';
import StarRating from '../components/common/StarRating';
import SkillTag from '../components/common/SkillTag';
import BookSessionModal from '../components/sessions/BookSessionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getUserAvatar } from '../utils/avatarUtils';
import {
  Sparkles,
  ArrowRight,
  Search,
  Repeat,
  Award,
  Users,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { toastError } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [skills, setSkills] = useState([]);
  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Booking modal state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const loadHomeData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [skillsData, usersData, statsData] = await Promise.all([
        skillService.getSkills({ limit: 8 }),
        userService.getUsers({ limit: 4, sortBy: 'rating' }),
        analyticsService.getPlatformStats(),
      ]);
      setSkills(skillsData || []);
      setFeaturedMentors(usersData.students || usersData.users || []);
      setPlatformStats(statsData || null);
    } catch (err) {
      console.error('Error loading home data:', err);
      const errMsg = err.customMessage || 'Failed to load home data.';
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch private database information when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadHomeData();
    } else {
      setSkills([]);
      setFeaturedMentors([]);
      setPlatformStats(null);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Real-time listener: refresh live platform stats and mentors whenever changes occur in MongoDB
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleStatsUpdated = () => {
      loadHomeData();
    };
    window.addEventListener('campus:stats:updated', handleStatsUpdated);
    window.addEventListener('campus:user:registered', handleStatsUpdated);
    window.addEventListener('campus:rating:submitted', handleStatsUpdated);
    window.addEventListener('campus:rating:updated', handleStatsUpdated);
    return () => {
      window.removeEventListener('campus:stats:updated', handleStatsUpdated);
      window.removeEventListener('campus:user:registered', handleStatsUpdated);
      window.removeEventListener('campus:rating:submitted', handleStatsUpdated);
      window.removeEventListener('campus:rating:updated', handleStatsUpdated);
    };
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please login to explore mentors and skills.');
      navigate('/login');
      return;
    }
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleExploreClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toastError('Please login to explore mentors and skills.');
      navigate('/login');
    }
  };

  const handleBookWithMentor = (mentor) => {
    if (!isAuthenticated) {
      toastError('Please login to request a session.');
      navigate('/login');
      return;
    }
    setSelectedMentor(mentor);
    setBookingModalOpen(true);
  };

  return (
    <div className="relative w-full overflow-hidden bg-transparent text-white min-h-screen">
      <div className="space-y-16 pb-16 relative z-10">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800/80 bg-transparent">
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.28, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/3 right-10 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Badge pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-brand-500/40 shadow-xs mb-6 hover:scale-105 transition-transform backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-xs font-semibold text-brand-300">
                Campus Peer-to-Peer Knowledge Sharing Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.15]"
            >
              Exchange Skills with Peers.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-purple-400 bg-clip-text text-transparent">
                Zero Money, Infinite Growth.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
              className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Teach Python in exchange for UI/UX design. Master machine learning, presentation skills, and web engineering directly from fellow college students.
            </motion.p>

            {/* Search bar */}
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24, ease: 'easeOut' }}
              onSubmit={handleSearchSubmit}
              className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2.5 p-2 bg-slate-900/85 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/50 transition-all"
            >
              <div className="flex items-center gap-2 px-3 flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What skill do you want to learn? (e.g., React, Python, UI/UX)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-white placeholder-slate-400 bg-transparent focus:outline-none py-2"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md shadow-brand-600/30 transition-all cursor-pointer"
              >
                <span>Find Mentors</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.form>

            {/* Error State Banner */}
            {error && isAuthenticated && (
              <div className="mt-6 max-w-xl mx-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs text-left">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={loadHomeData}
                  className="font-bold underline hover:no-underline whitespace-nowrap active:scale-95 transition-transform"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Counter Bar: Authenticated Live Counts vs Public Community Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80"
            >
              {isAuthenticated ? (
                <>
                  <div className="text-center p-3 rounded-xl hover:bg-slate-900/50 transition-colors">
                    <p className="text-2xl sm:text-3xl font-black text-white">
                      {loading ? '...' : platformStats?.activeStudents ?? 0}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Active Campus Students</p>
                  </div>
                  <div className="text-center p-3 rounded-xl hover:bg-slate-900/50 transition-colors">
                    <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                      {loading ? '...' : platformStats?.totalSkills ?? 0}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Skills in Directory</p>
                  </div>
                  <div className="text-center p-3 rounded-xl hover:bg-slate-900/50 transition-colors">
                    <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {loading ? '...' : platformStats?.completedSessions ?? 0}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Sessions Exchanged</p>
                  </div>
                  <div className="text-center p-3 rounded-xl hover:bg-slate-900/50 transition-colors">
                    <p className="text-2xl sm:text-3xl font-black text-purple-400">
                      {loading ? '...' : platformStats?.averageRating ? `${platformStats.averageRating} ★` : 'No ratings yet'}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Average Mentor Rating</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Peer-to-Peer Learning</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <p className="text-2xl sm:text-3xl font-black text-cyan-400">Free</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Skill-for-Skill Barter</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <p className="text-2xl sm:text-3xl font-black text-emerald-400">1-on-1</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Interactive Sessions</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <p className="text-2xl sm:text-3xl font-black text-purple-400">Verified</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Campus Community</p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* 2. How SkillVerse Works (Public Static Features Info) */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">
              How The Exchange Works
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Three simple steps to unlock campus knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="p-6 rounded-2xl bg-slate-900/75 backdrop-blur-sm border border-slate-800/90 shadow-lg hover:border-slate-700 card-hover-lift transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-950/80 text-brand-400 border border-brand-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. List Your Skills</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add skills you are confident to teach (like Python, Figma, or SQL), and add skills you are eager to learn this semester.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="p-6 rounded-2xl bg-slate-900/75 backdrop-blur-sm border border-slate-800/90 shadow-lg hover:border-slate-700 card-hover-lift transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Get Reciprocal Matches</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our smart algorithm pairs you with students who want what you can teach and teach what you want to learn. Mutual win-win!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="p-6 rounded-2xl bg-slate-900/75 backdrop-blur-sm border border-slate-800/90 shadow-lg hover:border-slate-700 card-hover-lift transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Earn Points & Badges</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete 1-on-1 virtual or campus sessions, exchange ratings, earn Skill Points, and unlock prestigious campus badges.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. Featured Peer Mentors */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Featured Student Mentors</h2>
              <p className="text-xs text-slate-400 mt-1">
                Top-rated peer tutors ready to share practical knowledge today
              </p>
            </div>
            <Link
              to={isAuthenticated ? '/explore' : '/login'}
              onClick={handleExploreClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:gap-2 transition-all"
            >
              <span>View all student mentors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-12 bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 p-8 max-w-2xl mx-auto shadow-lg">
              <Users className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Explore Campus Student Mentors</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Connect with peer tutors across engineering, design, data analysis, and communication.
                Sign in to view student mentor profiles, ratings, and request 1-on-1 learning sessions.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  Sign In to Browse Mentors
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold active:scale-95 transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : loading ? (
            <LoadingSpinner text="Fetching campus student mentors..." />
          ) : featuredMentors.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 p-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No registered users yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Be the first to join the network and offer your knowledge to peers!
              </p>
              <Link
                to="/register"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
              >
                Register as a Mentor
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMentors.map((mentor, index) => (
                <motion.div
                  key={mentor._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 hover:border-slate-700 shadow-lg card-hover-lift transition-all p-5 flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={getUserAvatar(mentor)}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{mentor.name}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{mentor.department}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 max-w-full">
                          {mentor.ratingsCount > 0 ? (
                            <StarRating rating={mentor.averageRating} ratingsCount={mentor.ratingsCount} size="xs" showValue />
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                              No ratings yet
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            • {mentor.completedSessionsCount || 0} sessions
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {mentor.bio}
                    </p>

                    {/* Skills they teach */}
                    <div className="mb-4">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                        Can Teach:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.skillsTeach?.length > 0 ? (
                          mentor.skillsTeach.slice(0, 3).map((st) => (
                            <SkillTag
                              key={st._id}
                              skill={st.skill?.name || 'Skill'}
                              type="teach"
                              size="sm"
                            />
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No skills listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBookWithMentor(mentor)}
                      className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-97 text-white text-xs font-semibold shadow-xs transition-all text-center"
                    >
                      Request Session
                    </button>
                    <Link
                      to={`/profile/${mentor._id}`}
                      className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 active:scale-95 transition-all"
                      title="View Student Profile"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* 4. Trending Campus Skills Directory Preview */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-950/90 backdrop-blur-sm border border-slate-800 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                Campus Taxonomy
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
                Skills Exchanged on Campus
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Explore skills across engineering, design, data analysis, and communication. Find qualified student peers in minutes.
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="mt-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center max-w-xl mx-auto relative z-10">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Log in to access the full campus taxonomy, propose new skills, and connect with peers teaching programming, design, and business skills.
                </p>
                <Link
                  to="/login"
                  className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  Sign In to Explore Skills
                </Link>
              </div>
            ) : loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading skills directory...</div>
            ) : skills.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No skills added to the campus taxonomy yet.
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap gap-2.5 relative z-10">
                {skills.map((s) => (
                  <Link
                    key={s._id}
                    to={`/explore?search=${encodeURIComponent(s.name)}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-brand-600 border border-slate-800 hover:border-brand-500 text-xs font-semibold text-slate-200 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xs"
                  >
                    {s.name} <span className="text-slate-400 hover:text-brand-200">({s.category})</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 relative z-10">
              <p className="text-xs text-slate-400">
                Missing a skill? Propose new skills directly through your student profile!
              </p>
              <Link
                to={isAuthenticated ? '/explore' : '/login'}
                onClick={handleExploreClick}
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white hover:gap-2.5 transition-all"
              >
                <span>
                  {isAuthenticated
                    ? `Explore All ${platformStats?.totalSkills ?? skills.length} Skills`
                    : 'Explore Campus Skills'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Booking Session Modal */}
        {selectedMentor && (
          <BookSessionModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            initialTeacher={selectedMentor}
            initialSkill={selectedMentor.skillsTeach?.[0]?.skill}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
