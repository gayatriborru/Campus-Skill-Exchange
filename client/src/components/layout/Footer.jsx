import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield, Code, BookOpen } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`${
        isHome ? 'bg-black border-t border-slate-800 text-slate-300' : 'bg-white border-t border-slate-200/80 text-slate-600'
      } pt-12 pb-8 mt-auto transition-colors duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
                SkillVerse
              </span>
            </Link>
            <p className={`text-xs ${isHome ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
              Campus Peer-to-Peer Knowledge Sharing. Teach what you know, master what you love, and grow together without money.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Campus Community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className={`text-xs font-bold uppercase tracking-wider ${isHome ? 'text-white' : 'text-slate-900'} mb-3`}>
              Explore
            </h5>
            <ul className={`space-y-2 text-xs ${isHome ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>
                <Link to="/explore" className="hover:text-cyan-400 transition-colors">
                  Browse Skills Directory
                </Link>
              </li>
              <li>
                <Link to="/matchmaker" className="hover:text-cyan-400 transition-colors">
                  Smart Matchmaker
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">
                  Campus Leaderboard & Badges
                </Link>
              </li>
              <li>
                <Link to="/sessions" className="hover:text-cyan-400 transition-colors">
                  Exchange Sessions
                </Link>
              </li>
            </ul>
          </div>

          {/* Skill Domains */}
          <div>
            <h5 className={`text-xs font-bold uppercase tracking-wider ${isHome ? 'text-white' : 'text-slate-900'} mb-3`}>
              Popular Tracks
            </h5>
            <ul className={`space-y-2 text-xs ${isHome ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>
                <Link to="/explore?category=Programming" className="hover:text-cyan-400 transition-colors">
                  Python, Java & Algorithms
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Web+Development" className="hover:text-cyan-400 transition-colors">
                  React, Node & Full-Stack
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Design" className="hover:text-cyan-400 transition-colors">
                  UI/UX & Figma Design Systems
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Data+%26+AI" className="hover:text-cyan-400 transition-colors">
                  Machine Learning & SQL
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Values */}
          <div className={`${isHome ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-100'} p-4 rounded-2xl border space-y-2`}>
            <h5 className={`text-xs font-bold ${isHome ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              Skill Honor Code
            </h5>
            <p className={`text-[11px] ${isHome ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
              Every 1-on-1 session is free of monetary cost. Learners award skill points & honest reviews to celebrate great teachers.
            </p>
          </div>
        </div>

        <div className={`pt-8 border-t ${isHome ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs`}>
          <p>© {new Date().getFullYear()} SkillVerse. Powered by Student Peer Exchanges.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for collegiate growth</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
