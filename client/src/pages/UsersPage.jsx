import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/common/StarRating';
import BadgePill from '../components/common/BadgePill';
import SkillTag from '../components/common/SkillTag';
import BookSessionModal from '../components/sessions/BookSessionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getUserAvatar } from '../utils/avatarUtils';
import {
  Users,
  Search,
  SlidersHorizontal,
  GraduationCap,
  MessageSquare,
  Calendar,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  Coins,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science & AI',
  'Design & Media',
  'Business Administration',
  'Other',
];

const UsersPage = () => {
  const { isAuthenticated } = useAuth();
  const { toastError } = useToast();
  const navigate = useNavigate();

  // Data state directly from MongoDB Atlas API
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter controls
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'rating', 'sessions', 'points'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Booking session modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Fetch real registered users from MongoDB Atlas via Express API
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers({
        search: search.trim() || undefined,
        department: department !== 'All' ? department : undefined,
        minRating: minRating || undefined,
        sortBy,
      });

      // Data source is strictly MongoDB through GET /api/users
      const userList = data.users || data.students || [];
      setUsers(userList);
    } catch (err) {
      console.error('Error fetching registered users:', err);
      const message =
        err.customMessage || 'Failed to load registered users. Please check your connection and try again.';
      setError(message);
      toastError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, department, minRating, sortBy, toastError]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchUsers]);

  // Real-time listener: when any new user registers in MongoDB, dynamically update the Users page
  useEffect(() => {
    const handleUserRegistered = () => {
      fetchUsers();
    };
    window.addEventListener('campus:user:registered', handleUserRegistered);
    return () => {
      window.removeEventListener('campus:user:registered', handleUserRegistered);
    };
  }, [fetchUsers]);

  // Real-time listener: when any rating is submitted or updated, update user cards immediately
  useEffect(() => {
    const handleRatingUpdated = (e) => {
      const detail = e.detail;
      if (detail?.teacherId) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === detail.teacherId
              ? {
                  ...u,
                  averageRating: detail.teacherAverageRating ?? u.averageRating,
                  ratingsCount: detail.teacherRatingsCount ?? ((u.ratingsCount || 0) + 1),
                }
              : u
          )
        );
      } else {
        fetchUsers();
      }
    };
    window.addEventListener('campus:rating:submitted', handleRatingUpdated);
    window.addEventListener('campus:rating:updated', handleRatingUpdated);
    return () => {
      window.removeEventListener('campus:rating:submitted', handleRatingUpdated);
      window.removeEventListener('campus:rating:updated', handleRatingUpdated);
    };
  }, [fetchUsers]);

  const handleBookSession = (targetUser, skill = null) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedUser(targetUser);
    setSelectedSkill(skill || targetUser.skillsTeach?.[0]?.skill || null);
    setBookingModalOpen(true);
  };

  const handleStartChat = (targetUserId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/messages?recipient=${targetUserId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2 hover:scale-105 transition-transform">
            <Users className="w-3.5 h-3.5" />
            <span>MongoDB Registered Users Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Users
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover real peers registered on the campus network. Connect, exchange skills, and grow together.
          </p>
        </div>

        {/* View Mode Switcher and Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold active:scale-95 transition-all disabled:opacity-50"
            title="Refresh latest users from MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold active:scale-90 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold active:scale-90 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* API Error State Banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Failed to load users</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors whitespace-nowrap shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs"
      >
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, department, bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition-all"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition-all"
          >
            <option value="">Rating: Any Rating</option>
            <option value="4.5">Rating: 4.5+ ★</option>
            <option value="4.8">Rating: 4.8+ ★</option>
            <option value="5.0">Rating: 5.0 ★ Only</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition-all"
          >
            <option value="newest">Sort: Newly Registered</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="sessions">Sort: Most Sessions</option>
            <option value="points">Sort: Most Skill Points</option>
          </select>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Fetching registered campus users from MongoDB..." />
      ) : users.length === 0 ? (
        /* Empty State: Exactly 'No registered users found' */
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No registered users yet</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            {search || department !== 'All' || minRating
              ? 'No registered users match your search criteria. Try clearing filters.'
              : 'There are currently no registered users stored in MongoDB Atlas. Register your account to appear in this directory!'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {(search || department !== 'All' || minRating) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setDepartment('All');
                  setMinRating('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Register New User
            </Link>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{users.length}</strong> registered campus user
              {users.length === 1 ? '' : 's'} from MongoDB
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u, index) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg card-hover-lift transition-all p-5 flex flex-col justify-between group overflow-hidden"
              >
                <div className="min-w-0 max-w-full">
                  {/* Top user identity */}
                  <div className="flex items-start gap-3 mb-3 min-w-0 max-w-full">
                    <img
                      src={getUserAvatar(u)}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-100 flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{u.name}</h3>
                        {u.role === 'admin' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex-shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {u.department} • {u.year}
                      </p>

                      {/* Rating & Sessions Row */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 max-w-full">
                        {u.ratingsCount > 0 ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <StarRating rating={u.averageRating} size="xs" showValue ratingsCount={u.ratingsCount} />
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0">
                            No ratings yet
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          • {u.completedSessionsCount || 0} sessions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Points Pill */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Coins className="w-3 h-3 text-emerald-600" />
                      {u.skillPoints || 0} pts
                    </span>
                    {u.availability && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {u.availability}
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {u.bio || 'Campus community member.'}
                  </p>

                  {/* Badges Preview */}
                  {u.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {u.badges.slice(0, 2).map((b) => (
                        <BadgePill key={b._id} badge={b} size="sm" />
                      ))}
                    </div>
                  )}

                  {/* Skills Can Teach */}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 mb-1">
                      Can Teach:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {u.skillsTeach?.length > 0 ? (
                        u.skillsTeach.map((s) => (
                          <SkillTag
                            key={s._id}
                            skill={s.skill?.name || 'Skill'}
                            type="teach"
                            proficiency={s.level}
                            size="sm"
                          />
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No skills listed yet</span>
                      )}
                    </div>
                  </div>

                  {/* Skills Want to Learn */}
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-brand-700 mb-1">
                      Wants to Learn:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {u.skillsLearn?.length > 0 ? (
                        u.skillsLearn.map((s) => (
                          <SkillTag
                            key={s._id}
                            skill={s.skill?.name || 'Skill'}
                            type="learn"
                            size="sm"
                          />
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Open to all skills</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBookSession(u)}
                    className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-97 text-white text-xs font-semibold shadow-xs transition-all text-center"
                  >
                    Request Session
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartChat(u._id)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-600 transition-all"
                    title="Send message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${u._id}`)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-600 transition-all"
                    title="View student profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5">Points</th>
                  <th className="px-6 py-3.5">Teaching Skills</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={getUserAvatar(u)}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      {u.department} • {u.year}
                    </td>

                    <td className="px-6 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                      {u.ratingsCount > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span>{Number(u.averageRating).toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                            ({u.ratingsCount})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">No ratings yet</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 font-bold text-emerald-700">
                      {u.skillPoints || 0} pts
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.skillsTeach?.length > 0 ? (
                          u.skillsTeach.slice(0, 2).map((s) => (
                            <SkillTag
                              key={s._id}
                              skill={s.skill?.name || 'Skill'}
                              type="teach"
                              size="sm"
                            />
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleBookSession(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors text-[11px]"
                        >
                          Book
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartChat(u._id)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Message"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/profile/${u._id}`)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="View Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Session Modal */}
      {selectedUser && (
        <BookSessionModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          initialTeacher={selectedUser}
          initialSkill={selectedSkill}
        />
      )}
    </div>
  );
};

export default UsersPage;
