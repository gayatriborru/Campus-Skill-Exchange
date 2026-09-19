import React, { useState, useEffect } from 'react';
import { sessionService } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReviewSessionModal from '../components/sessions/ReviewSessionModal';
import BookSessionModal from '../components/sessions/BookSessionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  Award,
  Plus,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SessionsPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('upcoming'); // 'all', 'upcoming', 'pending', 'completed'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'teaching', 'learning'

  // Modal States
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sessionService.getSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      const msg = err.customMessage || 'Could not load sessions from database.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      await sessionService.updateSession(sessionId, { status });
      toastSuccess(`Session marked as ${status}.`);
      fetchSessions();
    } catch (err) {
      toastError(err.customMessage || 'Failed to update session.');
    }
  };

  const handleOpenReview = (session) => {
    setSelectedSessionForReview(session);
    setReviewModalOpen(true);
  };

  // Filtered list
  const filteredSessions = sessions.filter((s) => {
    const isTeacher = s.teacher?._id === user?._id;
    const isLearner = s.learner?._id === user?._id;

    if (roleFilter === 'teaching' && !isTeacher) return false;
    if (roleFilter === 'learning' && !isLearner) return false;

    if (activeFilter === 'upcoming') {
      return ['Scheduled', 'Accepted'].includes(s.status);
    }
    if (activeFilter === 'pending') {
      return s.status === 'Pending';
    }
    if (activeFilter === 'completed') {
      return s.status === 'Completed';
    }
    return true; // 'all'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Exchange Sessions & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your peer mentorship dates, attend video sessions, and leave student reviews
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewBookingModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Session</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchSessions}
            className="font-bold underline hover:no-underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs & Role Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'pending', label: 'Pending Requests' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Sessions' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Role Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            All Roles
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('teaching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === 'teaching' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Teaching
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('learning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === 'learning' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Learning
          </button>
        </div>
      </div>

      {/* Sessions Content */}
      {loading ? (
        <LoadingSpinner text="Retrieving sessions..." />
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No sessions in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ready to exchange skills? Propose a session from the Explore page or Smart Matchmaker!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isTeacher = session.teacher?._id === user?._id;
            const peer = isTeacher ? session.learner : session.teacher;
            const isPendingTeacher = isTeacher && session.status === 'Pending';
            const isCompleted = session.status === 'Completed';
            const isScheduled = ['Scheduled', 'Accepted'].includes(session.status);

            const sessionDate = new Date(session.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={session._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Col: Peer info & Topic */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={
                      peer?.profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        peer?.name || 'Peer'
                      )}`
                    }
                    alt={peer?.name}
                    className="w-13 h-13 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isTeacher
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-brand-100 text-brand-800'
                        }`}
                      >
                        {isTeacher ? 'You are Teaching' : 'You are Learning'}
                      </span>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          session.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : session.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : session.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {session.topic || 'Skill Exchange Session'}
                    </h3>

                    <p className="text-xs text-slate-600">
                      With <span className="font-semibold text-slate-800">{peer?.name}</span> (
                      {peer?.department || 'Student'}) • Skill:{' '}
                      <span className="font-semibold text-brand-600">
                        {session.skill?.name || 'Topic'}
                      </span>
                    </p>

                    {session.notes && (
                      <p className="text-xs text-slate-500 italic">"{session.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Middle Col: Date & Time */}
                <div className="flex flex-row md:flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 text-xs text-slate-600 space-y-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>{sessionDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      {session.startTime} - {session.endTime}
                    </span>
                  </div>
                  {session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline pt-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Open Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Right Col: Actions */}
                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                  {/* Pending actions for Teacher */}
                  {isPendingTeacher && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(session._id, 'Accepted')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(session._id, 'Cancelled')}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* Scheduled Actions */}
                  {isScheduled && (
                    <>
                      <a
                        href={session.meetingLink || 'https://meet.google.com/new'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Video className="w-4 h-4" />
                        Join Call
                      </a>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(session._id, 'Completed')}
                        className="px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                      >
                        Mark Complete
                      </button>
                    </>
                  )}

                  {/* Completed & Rate Action (for Learner) */}
                  {isCompleted && !isTeacher && !session.rated && (
                    <button
                      type="button"
                      onClick={() => handleOpenReview(session)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      Rate & Review (+10 pts)
                    </button>
                  )}

                  {isCompleted && session.rated && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reviewed
                    </span>
                  )}

                  {/* Chat with peer */}
                  <button
                    type="button"
                    onClick={() => navigate(`/messages?recipient=${peer?._id}`)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Message Peer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedSessionForReview && (
        <ReviewSessionModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          session={selectedSessionForReview}
          onReviewSubmitted={() => fetchSessions()}
        />
      )}

      {/* New Booking Modal */}
      <BookSessionModal
        isOpen={newBookingModalOpen}
        onClose={() => setNewBookingModalOpen(false)}
        onSessionCreated={() => fetchSessions()}
      />
    </div>
  );
};

export default SessionsPage;
