import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  CalendarCheck,
  ShieldAlert,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  UserX,
  UserCheck,
  TrendingUp,
  BarChart2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboardPage = () => {
  const { toastSuccess, toastError } = useToast();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'reports'
  const [studentSearch, setStudentSearch] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, analyticsData, studentsData, reportsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAnalytics(),
        adminService.getStudents(),
        adminService.getReports(),
      ]);
      setStats(statsData || null);
      setAnalytics(analyticsData || null);
      setStudents(studentsData.users || studentsData.students || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
      const msg = err.customMessage || 'Failed to load administration data from database.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleSuspend = async (studentId, currentBlocked) => {
    if (!confirm(`Are you sure you want to ${currentBlocked ? 'reinstate' : 'suspend'} this student?`)) return;

    try {
      await adminService.toggleStudentSuspension(studentId);
      toastSuccess(`Student status updated.`);
      loadAdminData();
    } catch (err) {
      toastError(err.customMessage || 'Failed to update student status.');
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      await adminService.updateReportStatus(reportId, {
        status,
        resolutionNotes: `Marked as ${status} by campus administrator.`,
      });
      toastSuccess(`Report marked as ${status}.`);
      loadAdminData();
    } catch (err) {
      toastError(err.customMessage || 'Failed to update report status.');
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q);
  });

  if (loading) {
    return <LoadingSpinner text="Accessing campus admin console..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Oversight & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor platform metrics, moderate student safety reports, and review exchange health
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Analytics & KPIs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'students' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Students ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Safety Reports
            {stats?.pendingReports > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {stats.pendingReports}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadAdminData}
            className="font-bold underline hover:no-underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {stats?.totalStudents || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Registered Students</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {stats?.completedSessions || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Exchanges Completed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {stats?.totalSkills || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Skills in Taxonomy</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {stats?.pendingReports || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Pending Safety Flags</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Overview & Recharts Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Students by Department</h3>
                <p className="text-xs text-slate-400">Campus distribution across academic branches</p>
              </div>

              <div className="h-64 w-full">
                {analytics?.departmentData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.departmentData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No student department records available in MongoDB.
                  </div>
                )}
              </div>
            </div>

            {/* Most Popular Skills Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top In-Demand Skills</h3>
                <p className="text-xs text-slate-400">Most requested and taught competencies</p>
              </div>

              <div className="h-64 w-full">
                {(analytics?.skillsChartData?.length > 0 || analytics?.popularSkills?.length > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.skillsChartData || analytics.popularSkills}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No skill usage records available in MongoDB.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students Directory & Suspension Management */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">Student Account Moderation</h3>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search students by name, email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Points</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                      No student accounts found in database matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              st.profileImage ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                st.name
                              )}`
                            }
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{st.name}</p>
                            <p className="text-[11px] text-slate-400">{st.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-slate-600 font-medium">
                        {st.department} • {st.year}
                      </td>

                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        ★ {st.ratingsCount > 0 ? Number(st.averageRating || 0).toFixed(1) : '0.0'}
                      </td>

                      <td className="px-6 py-3.5 font-bold text-emerald-700">
                        {st.skillPoints || 0} pts
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.isBlocked
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {st.isBlocked ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleSuspend(st._id, st.isBlocked)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          st.isBlocked
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {st.isBlocked ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Reinstate
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            Suspend
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Safety Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Safety & Incident Reports Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review flagged student conduct, harassment, or no-shows reported by peers
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400">
              No reports currently filed. The campus community is healthy!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => (
                <div key={r._id} className="p-6 hover:bg-slate-50/50 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        {r.reason}
                      </span>
                      <span className="text-xs text-slate-500">
                        Reported on {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full self-start ${
                        r.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Status: {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 block">Reported Student:</span>
                      <span>{r.reportedUser?.name} ({r.reportedUser?.email})</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Reported By:</span>
                      <span>{r.reporter?.name} ({r.reporter?.email})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                    "{r.description}"
                  </p>

                  {r.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateReport(r._id, 'dismissed')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateReport(r._id, 'resolved')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                      >
                        Resolve & Close
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
