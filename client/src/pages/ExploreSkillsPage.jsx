import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { skillService } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import BadgePill from '../components/common/BadgePill';
import SkillTag from '../components/common/SkillTag';
import BookSessionModal from '../components/sessions/BookSessionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Search,
  Filter,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  GraduationCap,
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

const ExploreSkillsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('mentors'); // 'mentors' or 'skills'
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [categories, setCategories] = useState(['All']);
  const [department, setDepartment] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const [students, setStudents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Synchronize state with URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCat = searchParams.get('category');
    if (urlSearch !== null) setSearch(urlSearch);
    if (urlCat !== null) setCategory(urlCat);
  }, [searchParams]);

  // Load real categories from MongoDB
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadCategories = async () => {
      try {
        const cats = await skillService.getCategories();
        if (cats && cats.length > 0) {
          setCategories(['All', ...cats]);
        }
      } catch (err) {
        console.error('Error fetching categories from MongoDB:', err);
      }
    };
    loadCategories();
  }, [isAuthenticated]);

  // Fetch students or skills
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (activeTab === 'mentors') {
          const res = await userService.getUsers({
            search,
            department: department !== 'All' ? department : undefined,
            minRating: minRating || undefined,
            sortBy,
          });
          setStudents(res.users || res.students || []);
        } else {
          const res = await skillService.getSkills({
            category: category !== 'All' ? category : undefined,
            search,
          });
          setSkills(res || []);
        }
      } catch (err) {
        console.error('Error fetching directory data:', err);
        setError(err.customMessage || 'Failed to load skills. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, activeTab, search, category, department, minRating, sortBy]);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleBookSession = (mentor, skill = null) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedTeacher(mentor);
    setSelectedSkill(skill || mentor.skillsTeach?.[0]?.skill);
    setBookingModalOpen(true);
  };

  const handleStartChat = (mentorId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/messages?recipient=${mentorId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Campus Skills & Mentors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect with peer tutors, discover skills, and schedule free 1-on-1 knowledge exchanges
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab('mentors')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all ${
              activeTab === 'mentors'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Peer Mentors ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all ${
              activeTab === 'skills'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Skills Catalog
          </button>
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Pills Filter */}
      {categories.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-95 transition-all ${
                category === cat
                  ? 'bg-brand-600 text-white shadow-xs shadow-brand-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* Search & Secondary Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs"
      >
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={
              activeTab === 'mentors' ? 'Search by name, skill, or bio...' : 'Search skills...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                Dept: {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Min Rating Filter */}
        <div>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
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
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="rating">Sort: Highest Rated</option>
            <option value="sessions">Sort: Most Sessions Held</option>
            <option value="points">Sort: Most Skill Points</option>
            <option value="newest">Sort: Newly Joined</option>
          </select>
        </div>
      </motion.div>

      {/* Main Results Display */}
      {loading ? (
        <LoadingSpinner text="Searching campus peer community..." />
      ) : activeTab === 'mentors' ? (
        students.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No registered users yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No registered campus members in MongoDB match your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((st, index) => (
              <motion.div
                key={st._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg card-hover-lift transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top row: Avatar, Info, Rating */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={
                        st.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`
                      }
                      alt={st.name}
                      className="w-12 h-12 rounded-full object-cover border border-brand-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{st.name}</h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {st.department} • {st.year}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={st.averageRating} size="xs" showValue />
                        <span className="text-[10px] text-slate-400">
                          ({st.ratingsCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {st.bio}
                  </p>

                  {/* Badges preview */}
                  {st.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {st.badges.slice(0, 2).map((b) => (
                        <BadgePill key={b._id} badge={b} size="sm" />
                      ))}
                    </div>
                  )}

                  {/* Skills I Can Teach */}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 mb-1">
                      Can Teach:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {st.skillsTeach?.length > 0 ? (
                        st.skillsTeach.map((s) => (
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

                  {/* Skills I Want to Learn */}
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-brand-700 mb-1">
                      Wants to Learn:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {st.skillsLearn?.length > 0 ? (
                        st.skillsLearn.map((s) => (
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
                    onClick={() => handleBookSession(st)}
                    className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-97 text-white text-xs font-semibold shadow-xs transition-all text-center"
                  >
                    Request Session
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartChat(st._id)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-600 transition-all"
                    title="Message Student"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${st._id}`)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-600 transition-all"
                    title="View Profile"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* Skills Catalog Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg card-hover-lift transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {skill.category}
                  </span>
                  <span className="text-[11px] text-brand-600 font-semibold">
                    {skill.popularityCount || 1} peer teachers
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{skill.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{skill.description}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch(skill.name);
                  setActiveTab('mentors');
                }}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 active:scale-98 text-slate-700 text-xs font-semibold transition-all"
              >
                Find Mentors Teaching This Skill
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedTeacher && (
        <BookSessionModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          initialTeacher={selectedTeacher}
          initialSkill={selectedSkill}
        />
      )}
    </div>
  );
};

export default ExploreSkillsPage;
