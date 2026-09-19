import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import StarRating from '../components/common/StarRating';
import BadgePill from '../components/common/BadgePill';
import SkillTag from '../components/common/SkillTag';
import AddSkillModal from '../components/skills/AddSkillModal';
import BookSessionModal from '../components/sessions/BookSessionModal';
import ReportUserModal from '../components/common/ReportUserModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  User,
  Plus,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Edit3,
  Award,
  Coins,
  CheckCircle2,
  BookOpen,
  Sparkles,
  MapPin,
  Clock,
  AlertCircle,
} from 'lucide-react';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: authUser, updateProfile, refreshUser } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const isOwnProfile = !id || id === authUser?._id;
  const [profile, setProfile] = useState(null);
  const [skillsTeach, setSkillsTeach] = useState([]);
  const [skillsLearn, setSkillsLearn] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editAvailability, setEditAvailability] = useState('Flexible');
  const [savingProfile, setSavingProfile] = useState(false);

  // Modals
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [skillModalType, setSkillModalType] = useState('teach');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isOwnProfile) {
        // Fetch own fresh profile + skills
        const freshUser = await refreshUser();
        const skillsData = await userService.getMySkills();
        setProfile(freshUser || authUser);
        setSkillsTeach(skillsData.skillsTeach || []);
        setSkillsLearn(skillsData.skillsLearn || []);

        // Also fetch full public profile for badges/reviews
        if (authUser?._id) {
          const fullProfile = await userService.getUserById(authUser._id);
          setBadges(fullProfile.badges || []);
          setReviews(fullProfile.reviews || []);
        }

        setEditBio(freshUser?.bio || authUser?.bio || '');
        setEditDept(freshUser?.department || authUser?.department || '');
        setEditYear(freshUser?.year || authUser?.year || '');
        setEditAvailability(freshUser?.availability || authUser?.availability || 'Flexible');
      } else {
        const student = await userService.getUserById(id);
        setProfile(student);
        setSkillsTeach(student.skillsTeach || []);
        setSkillsLearn(student.skillsLearn || []);
        setBadges(student.badges || []);
        setReviews(student.reviews || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      const msg = err.customMessage || 'Failed to load profile from database.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id, isOwnProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile({
        bio: editBio.trim(),
        department: editDept,
        year: editYear,
        availability: editAvailability,
      });
      toastSuccess('Profile details saved!');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      toastError(err.customMessage || 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteSkill = async (studentSkillId) => {
    if (!confirm('Are you sure you want to remove this skill from your portfolio?')) return;
    try {
      await userService.deleteStudentSkill(studentSkillId);
      toastSuccess('Skill removed from profile.');
      loadProfile();
    } catch (err) {
      toastError(err.customMessage || 'Failed to remove skill.');
    }
  };

  const openAddSkill = (type) => {
    setSkillModalType(type);
    setAddSkillModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading student profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center py-20 max-w-xl mx-auto px-4">
        {error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadProfile}
              className="font-bold underline hover:no-underline whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Student profile not found.</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadProfile}
            className="font-bold underline hover:no-underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner background */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Info row */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            {/* Avatar & Title */}
            <div className="flex items-end gap-4">
              <img
                src={
                  profile.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    profile.name
                  )}`
                }
                alt={profile.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
              />
              <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {profile.department} • {profile.year}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 mb-2">
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Close Editing' : 'Edit Profile'}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Request Session</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/messages?recipient=${profile._id}`)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                    title="Direct Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Report Safety Issue"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <div className="text-center">
              <span className="text-lg sm:text-xl font-bold text-slate-900 block">
                ★ {profile.ratingsCount > 0 ? Number(profile.averageRating || 0).toFixed(1) : '0.0'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {profile.ratingsCount || 0} Peer Reviews
              </span>
            </div>
            <div className="text-center border-l border-slate-200/80">
              <span className="text-lg sm:text-xl font-bold text-brand-600 block">
                {profile.completedSessionsCount || 0}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Sessions Exchanged</span>
            </div>
            <div className="text-center border-l border-slate-200/80">
              <span className="text-lg sm:text-xl font-bold text-emerald-600 block flex items-center justify-center gap-1">
                <Coins className="w-4 h-4 text-emerald-500" />
                {profile.skillPoints || 0}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Skill Points</span>
            </div>
            <div className="text-center border-l border-slate-200/80">
              <span className="text-lg sm:text-xl font-bold text-indigo-600 block">
                {profile.availability || 'Flexible'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Availability</span>
            </div>
          </div>

          {/* Edit Form Drawer */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="p-5 bg-white border border-brand-200 rounded-2xl mb-6 space-y-4 shadow-sm animate-in fade-in duration-150"
            >
              <h3 className="text-sm font-bold text-slate-900">Update Profile Information</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Bio / Learning Goals
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Design & Media">Design & Media</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    College Year
                  </label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Availability
                  </label>
                  <select
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Evenings">Evenings</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Bio text */}
          {!isEditing && (
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              {profile.bio || 'Passionate student eager to share skills and learn from campus peers.'}
            </p>
          )}
        </div>
      </div>

      {/* Skills Matrix: Teach vs Learn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills I Can Teach */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Skills {isOwnProfile ? 'I' : profile.name} Can Teach
              </h3>
            </div>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => openAddSkill('teach')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Skill
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skillsTeach.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No teaching skills added yet.</p>
            ) : (
              skillsTeach.map((st) => (
                <SkillTag
                  key={st._id}
                  skill={st.skill?.name || 'Skill'}
                  type="teach"
                  proficiency={st.level}
                  onRemove={isOwnProfile ? () => handleDeleteSkill(st._id) : undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Skills {isOwnProfile ? 'I' : profile.name} Want to Learn
              </h3>
            </div>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => openAddSkill('learn')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Goal
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skillsLearn.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No learning goals registered yet.</p>
            ) : (
              skillsLearn.map((sl) => (
                <SkillTag
                  key={sl._id}
                  skill={sl.skill?.name || 'Skill'}
                  type="learn"
                  proficiency={sl.level}
                  onRemove={isOwnProfile ? () => handleDeleteSkill(sl._id) : undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gamification Badges Shelf */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Unlocked Campus Badges</h3>
              <p className="text-xs text-slate-500">Achievements earned through mentorship and community trust</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {badges.length} Unlocked
          </span>
        </div>

        {badges.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">
            Complete your first session or give a review to unlock badges!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {badges.map((badge) => (
              <div
                key={badge._id}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-amber-50/40 via-white to-slate-50 border border-amber-200/80 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{badge.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews & Testimonials */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Reviews from Students ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No reviews recorded yet.</p>
        ) : (
          <div className="space-y-4 pt-2">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        rev.learner?.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          rev.learner?.name || 'Student'
                        )}`
                      }
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-900">{rev.learner?.name}</span>
                    <span className="text-[10px] text-slate-400">• {rev.learner?.department}</span>
                  </div>
                  <StarRating rating={rev.overallRating} size="xs" showValue />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.feedback}"
                </p>

                <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                  <span>Knowledge: {rev.skillKnowledge}/5</span>
                  <span>Communication: {rev.communication}/5</span>
                  <span>Helpfulness: {rev.helpfulness}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={addSkillModalOpen}
        onClose={() => setAddSkillModalOpen(false)}
        defaultType={skillModalType}
        onSkillAdded={() => loadProfile()}
      />

      {/* Booking Modal */}
      {!isOwnProfile && profile && (
        <BookSessionModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          initialTeacher={profile}
          initialSkill={skillsTeach?.[0]?.skill}
        />
      )}

      {/* Safety Report Modal */}
      {!isOwnProfile && profile && (
        <ReportUserModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetUser={profile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
