import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import {
  Sparkles,
  Compass,
  Repeat,
  Calendar,
  MessageSquare,
  Trophy,
  Shield,
  Bell,
  Coins,
  LogOut,
  User,
  Users,
  ChevronDown,
  Menu,
  X,
  Check,
  Home,
  Info,
  Mail,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const { toastSuccess, toastError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when notification popover opens
  useEffect(() => {
    if (notifDropdownOpen && isAuthenticated) {
      const fetchNotifs = async () => {
        try {
          setLoadingNotifs(true);
          const data = await notificationService.getNotifications();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        } catch (err) {
          console.error('Error fetching notifications:', err);
        } finally {
          setLoadingNotifs(false);
        }
      };
      fetchNotifs();
    }
  }, [notifDropdownOpen, isAuthenticated, setUnreadCount]);

  // Real-time listener: update notification state immediately on incoming socket notification
  useEffect(() => {
    const handleNewNotif = (e) => {
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener('campus:notification:new', handleNewNotif);
    return () => window.removeEventListener('campus:notification:new', handleNewNotif);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toastSuccess('All notifications marked as read.');
    } catch (err) {
      toastError('Failed to mark notifications read.');
    }
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
    toastSuccess('Signed out successfully.');
  };

  const publicNavLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const authNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Skill Explorer', path: '/explore', icon: Compass },
    { name: 'Find Mentors', path: '/users', icon: Users },
    { name: 'Sessions', path: '/sessions', icon: Calendar },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (isAdmin) {
    authNavLinks.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  const activeLinks = isAuthenticated ? authNavLinks : publicNavLinks;

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && (location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/')))) return true;
    return false;
  };

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-40 backdrop-blur-md border-b bg-black/80 border-slate-800 text-white transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 group-hover:shadow-brand-500/40 transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  SkillVerse
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                  Campus Exchange
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {activeLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 ${
                      active
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Actions Header */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Skill Points Balance Pill */}
                <div
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold shadow-xs cursor-pointer hover:bg-emerald-900/60 active:scale-95 transition-all"
                  title="Campus Skill Points: Earn points by teaching peers, spend to book learning sessions!"
                  onClick={() => navigate('/leaderboard')}
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>{user?.skillPoints || 0} pts</span>
                </div>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 active:scale-90 transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl py-2 z-50 origin-top-right text-slate-200"
                      >
                        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">Notifications</h4>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold active:scale-95 transition-transform"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                          {loadingNotifs ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                              Loading notifications...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                              No notifications yet!
                            </div>
                          ) : (
                          notifications.map((n) => {
                            const isUnread = !n.read && !n.isRead;
                            const isSessionReq = n.type === 'SESSION_REQUEST';
                            const meta = n.metadata || {};

                            return (
                              <div
                                key={n._id}
                                onClick={() => {
                                  setNotifDropdownOpen(false);
                                  if (isUnread) {
                                    notificationService.markAsRead(n._id).catch(() => {});
                                    setNotifications((prev) =>
                                      prev.map((item) =>
                                        item._id === n._id
                                          ? { ...item, read: true, isRead: true }
                                          : item
                                      )
                                    );
                                    setUnreadCount((c) => Math.max(0, c - 1));
                                  }
                                  navigate(n.link || '/sessions');
                                }}
                                className={`p-3 text-xs hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-2.5 ${
                                  isUnread ? 'bg-cyan-950/25 border-l-2 border-cyan-400' : ''
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="font-semibold text-white flex items-center gap-1.5 truncate">
                                      {isSessionReq && (
                                        <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                      )}
                                      <span>{n.title}</span>
                                    </p>
                                    {isUnread ? (
                                      <span
                                        className="flex-shrink-0 w-2 h-2 rounded-full bg-cyan-400 shadow-xs"
                                        title="Unread"
                                      />
                                    ) : (
                                      <span className="text-[10px] text-slate-500">Read</span>
                                    )}
                                  </div>

                                  <p className="text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>

                                  {/* Detailed Metadata for Session Requests */}
                                  {isSessionReq && (
                                    <div className="mt-1.5 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-0.5 text-slate-400">
                                      {meta.requesterName && (
                                        <div>
                                          <span className="text-slate-500">Requester: </span>
                                          <span className="font-semibold text-white">
                                            {meta.requesterName}
                                          </span>
                                        </div>
                                      )}
                                      {meta.skillName && (
                                        <div>
                                          <span className="text-slate-500">Skill: </span>
                                          <span className="font-semibold text-brand-300">
                                            {meta.skillName}
                                          </span>
                                        </div>
                                      )}
                                      {meta.dateTime && (
                                        <div>
                                          <span className="text-slate-500">Date/Time: </span>
                                          <span className="text-slate-300">{meta.dateTime}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                                    <span>
                                      {new Date(n.createdAt).toLocaleDateString([], {
                                        month: 'short',
                                        day: 'numeric',
                                      })}{' '}
                                      at{' '}
                                      {new Date(n.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                    <span className="text-cyan-400 font-medium hover:underline">
                                      Open Session →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 active:scale-95 transition-all focus:outline-none"
                  >
                    <img
                      src={
                        user?.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          user?.name || 'Student'
                        )}`
                      }
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-brand-200 transition-transform hover:scale-105"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200" />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl py-2 z-50 origin-top-right text-slate-200"
                      >
                        <div className="px-4 py-2.5 border-b border-slate-800">
                          <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {user?.department}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Profile & Skills
                          </Link>
                          <Link
                            to="/sessions"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Session Schedule
                          </Link>
                        </div>

                        <div className="border-t border-slate-800 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 active:scale-98 transition-all text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-400" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Direct Desktop Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-rose-900/60 bg-slate-900/60 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-sm shadow-brand-600/25 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl active:scale-90 transition-all text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden border-t px-4 pt-2 pb-6 space-y-1 shadow-lg overflow-hidden border-slate-800 bg-slate-950 text-white"
          >
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <User className={`w-4 h-4 ${isActive('/profile') ? 'text-cyan-400' : 'text-slate-400'}`} />
                  Profile
                </Link>

                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={
                          user?.profileImage ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            user?.name || 'Student'
                          )}`
                        }
                        alt={user?.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span className="font-semibold text-white truncate">{user?.name}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{user?.skillPoints || 0} pts</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-950/60 text-sm font-semibold active:scale-98 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-sm font-semibold text-slate-300 hover:bg-slate-900 active:scale-98 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-sm active:scale-98 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
