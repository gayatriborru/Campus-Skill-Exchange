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

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Matchmaker', path: '/matchmaker', icon: Repeat, authRequired: true },
    { name: 'Sessions', path: '/sessions', icon: Calendar, authRequired: true },
    { name: 'Messages', path: '/messages', icon: MessageSquare, authRequired: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isHome = location.pathname === '/';

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
        isHome ? 'bg-black/80 border-slate-800 text-white' : 'bg-white/80 border-slate-200/80 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
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
              {navLinks.map((link) => {
                if (link.authRequired && !isAuthenticated) return null;
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 ${
                      active
                        ? isHome
                          ? 'bg-slate-800 text-white font-semibold shadow-xs'
                          : 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                        : isHome
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? (isHome ? 'text-cyan-400' : 'text-brand-600') : 'text-slate-400'}`} />
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
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all"
                  title="Campus Skill Points: Earn points by teaching peers, spend to book learning sessions!"
                  onClick={() => navigate('/leaderboard')}
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>{user?.skillPoints || 0} pts</span>
                </div>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 active:scale-90 transition-all"
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
                        className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 origin-top-right"
                      >
                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-brand-600 hover:text-brand-700 font-semibold active:scale-95 transition-transform"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                          {loadingNotifs ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                              Loading notifications...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                              No notifications yet!
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n._id}
                                className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                                  !n.isRead ? 'bg-brand-50/40' : ''
                                }`}
                              >
                                <p className="font-semibold text-slate-800">{n.title}</p>
                                <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            ))
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
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 origin-top-right"
                      >
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {user?.department}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Profile & Skills
                          </Link>
                          <Link
                            to="/sessions"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Session Schedule
                          </Link>
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                              navigate('/login');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 active:scale-98 transition-all text-left"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all ${
                    isHome
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-sm shadow-brand-600/25 transition-all"
                >
                  Join Campus Network
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl active:scale-90 transition-all ${
                isHome
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
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
            className={`md:hidden border-t px-4 pt-2 pb-6 space-y-1 shadow-lg overflow-hidden ${
              isHome ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white'
            }`}
          >
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? isHome
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-brand-50 text-brand-700 font-semibold'
                      : isHome
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? (isHome ? 'text-cyan-400' : 'text-brand-600') : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
            {!isAuthenticated && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 active:scale-98 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-sm active:scale-98 transition-all"
                >
                  Join Campus Network
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
