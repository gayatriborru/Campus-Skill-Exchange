import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { contactService } from '../services/contactService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowLeft,
  Mail,
  User,
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  ShieldCheck,
} from 'lucide-react';

const ContactPage = () => {
  const { isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [serverError, setServerError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) return 'Name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (value.trim().length > 100) return 'Name cannot exceed 100 characters.';
        return '';
      case 'email':
        if (!value || !value.trim()) return 'Email address is required.';
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      case 'subject':
        if (!value || !value.trim()) return 'Subject is required.';
        if (value.trim().length < 3) return 'Subject must be at least 3 characters.';
        if (value.trim().length > 200) return 'Subject cannot exceed 200 characters.';
        return '';
      case 'message':
        if (!value || !value.trim()) return 'Message is required.';
        if (value.trim().length < 10) return 'Message must be at least 10 characters.';
        if (value.trim().length > 5000) return 'Message cannot exceed 5000 characters.';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError('');

    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    setServerError('');

    const isValid = validateAll();
    if (!isValid) return;

    try {
      setSubmitting(true);
      const res = await contactService.submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSubmittedSuccessfully(true);
      toastSuccess('Your message has been sent successfully.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTouched({});
      setErrors({});
    } catch (err) {
      console.error('Contact submission error:', err);
      const msg =
        err.response?.data?.message ||
        err.customMessage ||
        'Failed to send message. Please check your details and try again.';
      setServerError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-transparent text-white min-h-screen">
      <div className="space-y-12 pb-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
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

        {/* Header Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto relative">
          {/* Ambient Glow */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-brand-500/40 shadow-xs backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-brand-300 tracking-wide uppercase">
              Get in Touch
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            Contact{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-purple-400 bg-clip-text text-transparent">
              Us
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed"
          >
            Have a question, feedback, or suggestion about our campus peer platform? Send us a
            message and our team will get back to you promptly.
          </motion.p>
        </section>

        {/* Content Grid: Form + Info Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Main Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-6 relative"
          >
            {/* Success Banner */}
            <AnimatePresence>
              {submittedSuccessfully && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-sm flex items-start gap-3 shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white">Your message has been sent successfully.</p>
                    <p className="text-xs text-emerald-300">
                      Thank you for reaching out! Our campus coordinators review messages and reply
                      within 24 hours.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Server Error Banner */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Submission Error</p>
                    <p className="text-xs text-rose-300">{serverError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-brand-400" />
                  <span>Name</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Alex Rivera"
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.name && errors.name
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
                  }`}
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                  <span>Email</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. alex@campus.edu"
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.email && errors.email
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
                  <span>Subject</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Question about skill exchange sessions"
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.subject && errors.subject
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
                  }`}
                />
                {touched.subject && errors.subject && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.subject}</span>
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                  <span>Message</span>
                  <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Describe your inquiry, feedback, or suggestion in detail..."
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all resize-y ${
                    touched.message && errors.message
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
                  }`}
                />
                {touched.message && errors.message && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Sidebar Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Direct Information */}
            <div className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Campus Peer Network</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                SkillVerse is designed and maintained for university students. We value your input
                on feature enhancements, mentor safety, and campus partnership ideas.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Platform Support</span>
                    <span className="text-slate-400">Direct inquiries to campus moderators</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Response Window</span>
                    <span className="text-slate-400">Usually under 24 hours during academic terms</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Student Privacy</span>
                    <span className="text-slate-400">Inquiries are confidential & never shared</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Learn More About Us
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Curious about how mutual skill exchanges and learning sessions operate?
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                <span>Read About the Platform & How It Works</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
