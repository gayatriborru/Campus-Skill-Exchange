import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import GlowCursor from './components/animations/GlowCursor';

import HomePage from './pages/HomePage';
import ExploreSkillsPage from './pages/ExploreSkillsPage';
import MatchmakerPage from './pages/MatchmakerPage';
import SessionsPage from './pages/SessionsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import UsersPage from './pages/UsersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      {/* Global React Bits Glow Cursor Background Visual Effect across ALL routes */}
      <GlowCursor
        className="fixed inset-0 pointer-events-none z-0"
        color="#67E8F9"
        secondaryColor="#A78BFA"
        trailLength={40}
        trailWidth={8}
        trailTaper={0.8}
        glowIntensity={1.8}
        glowSpread={1.2}
        pulseSpeed={1.1}
        blendMode="screen"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            <Routes location={location}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExploreSkillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explorer"
            element={
              <ProtectedRoute>
                <ExploreSkillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentors"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MatchmakerPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Student Routes */}
          <Route
            path="/matchmaker"
            element={
              <ProtectedRoute>
                <MatchmakerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;
