import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { skillService } from '../services/skillService';
import { userService } from '../services/userService';
import { analyticsService } from '../services/analyticsService';
import StarRating from '../components/common/StarRating';
import BadgePill from '../components/common/BadgePill';
import SkillTag from '../components/common/SkillTag';
import BookSessionModal from '../components/sessions/BookSessionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Sparkles,
  ArrowRight,
  Search,
  Repeat,
  Award,
  Users,
  CalendarCheck,
  CheckCircle2,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { toastError } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [skills, setSkills] = useState([]);
  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking modal state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [skillsData, usersData, statsData] = await Promise.all([
        skillService.getSkills({ limit: 8 }),
        userService.getUsers({ limit: 4, sortBy: 'rating' }),
        analyticsService.getPlatformStats(),
      ]);
      setSkills(skillsData || []);
      setFeaturedMentors(usersData.students || []);
      setPlatformStats(statsData || null);
    } catch (err) {
      console.error('Error loading home data:', err);
      const errMsg = err.customMessage || 'Unable to connect to campus backend API. Please ensure server is running.';
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleBookWithMentor = (mentor) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedMentor(mentor);
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200/60">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-brand-200/80 shadow-xs mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
            <span className="text-xs font-semibold text-brand-900">
              Campus Peer-to-Peer Knowledge Sharing Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Exchange Skills with Peers.{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Zero Money, Infinite Growth.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Teach Python in exchange for UI/UX design. Master machine learning, presentation skills, and web engineering directly from fellow college students.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2.5 p-2 bg-white rounded-2xl shadow-xl shadow-brand-500/5 border border-slate-200/80 focus-within:ring-2 focus-within:ring-brand-500 transition-all"
          >
            <div className="flex items-center gap-2 px-3 flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="What skill do you want to learn? (e.g., React, Python, UI/UX)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              <span>Find Mentors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Error State Banner */}
          {error && (
            <div className="mt-6 max-w-xl mx-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadHomeData}
                className="font-bold underline hover:no-underline whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          )}

          {/* Real Campus Stats Counter Bar (Data from MongoDB) */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/70">
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {loading ? '...' : platformStats?.activeStudents ?? 0}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Active Campus Students</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-brand-600">
                {loading ? '...' : platformStats?.totalSkills ?? 0}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Skills in Directory</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                {loading ? '...' : platformStats?.completedSessions ?? 0}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Sessions Exchanged</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-purple-600">
                {loading ? '...' : platformStats?.averageRating ? `${platformStats.averageRating} ★` : '0.0 ★'}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Average Mentor Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How SkillVerse Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600">
            How The Exchange Works
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Three simple steps to unlock campus knowledge
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1. List Your Skills</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add skills you are confident to teach (like Python, Figma, or SQL), and add skills you are eager to learn this semester.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">2. Get Reciprocal Matches</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our smart algorithm pairs you with students who want what you can teach and teach what you want to learn. Mutual win-win!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">3. Earn Points & Badges</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete 1-on-1 virtual or campus sessions, exchange ratings, earn Skill Points, and unlock prestigious campus badges.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Peer Mentors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Student Mentors</h2>
            <p className="text-xs text-slate-500 mt-1">
              Top-rated peer tutors ready to share practical knowledge today
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>View all student mentors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching campus student mentors..." />
        ) : featuredMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No student mentors registered yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Be the first to join the network and offer your knowledge to peers!
            </p>
            <Link
              to="/register"
              className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-xs"
            >
              Register as a Mentor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={
                        mentor.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentor.name)}`
                      }
                      alt={mentor.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-100"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{mentor.name}</h3>
                      <p className="text-[11px] text-slate-500 truncate">{mentor.department}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={mentor.averageRating} size="xs" showValue />
                        <span className="text-[10px] text-slate-400">
                          • {mentor.completedSessionsCount || 0} sessions
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
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
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBookWithMentor(mentor)}
                    className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors text-center"
                  >
                    Request Session
                  </button>
                  <Link
                    to={`/profile/${mentor._id}`}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="View Student Profile"
                  >
                    <Users className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Trending Campus Skills Directory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-wider text-brand-400">
              Campus Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
              Skills Exchanged on Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Explore skills across engineering, design, data analysis, and communication. Find qualified student peers in minutes.
            </p>
          </div>

          {loading ? (
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
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-brand-600 border border-slate-700 hover:border-brand-500 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-xs"
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
              to="/explore"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-300 hover:text-white"
            >
              <span>Explore All {platformStats?.totalSkills ?? skills.length} Skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

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
  );
};

export default HomePage;
