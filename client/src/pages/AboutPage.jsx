import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowLeft,
  Repeat,
  Users,
  Calendar,
  Send,
  UserCheck,
  Trophy,
  Bell,
  Star,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const AboutPage = () => {
  const { isAuthenticated } = useAuth();
  const steps = [
    {
      number: '01',
      title: 'Create an Account',
      description:
        'Sign up using your verified college email to join your campus knowledge network in seconds.',
      icon: GraduationCap,
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      number: '02',
      title: 'Add or Explore Skills',
      description:
        'Showcase the technologies and topics you can teach, or explore skills you want to learn from fellow students.',
      icon: Lightbulb,
      accent: 'from-brand-500 to-indigo-600',
    },
    {
      number: '03',
      title: 'Find a Peer',
      description:
        'Browse peer mentors by subject, compare mutual interests, and connect with peers whose schedules align with yours.',
      icon: Users,
      accent: 'from-purple-500 to-pink-600',
    },
    {
      number: '04',
      title: 'Request & Complete a Session',
      description:
        'Send a structured session request, meet for 1-on-1 peer learning, and award honest ratings & reviews.',
      icon: Calendar,
      accent: 'from-emerald-500 to-teal-600',
    },
  ];

  const keyFeatures = [
    {
      title: 'Skill Exchange',
      description:
        'Exchange knowledge bi-directionally without monetary barriers. Teach what you are confident in, learn what you love.',
      icon: Repeat,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Find Peer Mentors',
      description:
        'Discover passionate classmates across engineering, design, and science ready to provide 1-on-1 guidance.',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Learning Sessions',
      description:
        'Coordinate live peer-to-peer study sessions with clear agendas, meeting links, and calendar scheduling.',
      icon: Calendar,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Session Requests',
      description:
        'Easily propose learning topics, specify preferred time slots, and manage incoming and outgoing session requests.',
      icon: Send,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Student Profiles',
      description:
        'Express your academic focus, department, listed skills to teach, and skills you are excited to master.',
      icon: UserCheck,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Leaderboard',
      description:
        'Celebrate campus contributors, top-rated student mentors, and active learners through achievement points.',
      icon: Trophy,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Notifications',
      description:
        'Stay updated in real-time on session confirmations, mentorship requests, and peer reviews.',
      icon: Bell,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Ratings & Reviews',
      description:
        'Foster trust and accountability across the campus community through constructive, transparent feedback.',
      icon: Star,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const whyPoints = [
    {
      title: 'Zero Financial Barrier',
      desc: 'High-quality tutoring should not be limited by student budgets. Every exchange is powered by mutual goodwill and shared learning.',
    },
    {
      title: 'Real-World Teaching Mastery',
      desc: 'Teaching a peer is the most effective way to truly master a complex subject. Feynman technique in everyday campus action.',
    },
    {
      title: 'Collegiate Collaboration',
      desc: 'Break silos across academic batches and departments. Build lasting connections with motivated students who share your passion.',
    },
    {
      title: 'Verified Student Environment',
      desc: 'A focused, safe, and positive learning atmosphere built exclusively for college students and peer learners.',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-transparent text-white min-h-screen">
      <div className="space-y-20 pb-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Back to Home Navigation Link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-sm transition-all duration-150 active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}</span>
          </Link>
        </motion.div>

        {/* Section 1: Hero & About the Platform */}
        <section className="relative overflow-hidden text-center space-y-6 pt-2">
          {/* Ambient Glow Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.28, 0.15],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-brand-500/40 shadow-xs backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-brand-300 tracking-wide uppercase">
              About the Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Campus Peer-to-Peer{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-purple-400 bg-clip-text text-transparent">
              Knowledge Sharing Platform
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            A campus-based skill exchange platform where students can teach skills they know and
            learn skills from fellow students without exchanging money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl max-w-3xl mx-auto text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Our Core Mission</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Campus Peer-to-Peer Knowledge Sharing Platform connects college students who want to
                  exchange knowledge and skills. Students can teach skills they are confident in and
                  learn new skills from their peers through session-based knowledge exchange. By
                  transforming campuses into collaborative ecosystems, we empower students to thrive
                  academically and professionally.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: How It Works */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Simple 4-Step Process</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Get started with peer exchange in minutes. Seamlessly transition from learner to teacher
              and back.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-slate-600 group-hover:text-slate-400 transition-colors font-mono">
                        {step.number}
                      </span>
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.accent} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Why Skill Exchange? */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>The Peer Advantage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why Skill Exchange?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Traditional tutoring can be expensive and intimidating. Peer exchange makes learning
              natural, accessible, and reciprocal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyPoints.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-lg flex items-start gap-4 hover:bg-slate-900/90 hover:border-slate-700 transition-all"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 4: Key Features */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-brand-500/30 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Key Features
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Engineered with modern tools to make peer collaboration smooth, safe, and engaging.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="p-5 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className={`w-10 h-10 rounded-2xl ${feat.bg} flex items-center justify-center border ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Peer-to-Peer Learning */}
        <section className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>The Learning Philosophy</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Peer-to-Peer Learning & Growth
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                When students learn from students, anxiety disappears and questions flow freely. Peers
                understand the specific academic struggles, coursework deadlines, and conceptual hurdles
                because they have experienced them firsthand. By eliminating money and focusing on
                genuine exchange, SkillVerse cultivates a campus culture of mutual respect, mastery, and
                unbounded growth.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-stretch">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-600/30 transition-all active:scale-95 text-center"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Join Campus Network'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all active:scale-95 text-center"
              >
                <span>Contact Our Team</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
