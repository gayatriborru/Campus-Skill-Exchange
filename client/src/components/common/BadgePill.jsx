import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  Flame,
  HeartHandshake,
  Share2,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

const ICON_MAP = {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  Flame,
  HeartHandshake,
  Share2,
  ShieldCheck,
  Trophy,
};

const CATEGORY_COLORS = {
  Teaching: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/20',
  Learning: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-indigo-500/20',
  Excellence: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-500/30',
  Community: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/20',
  General: 'bg-purple-50 text-purple-700 border-purple-200/80 ring-purple-500/20',
};

const BadgePill = ({ badge, size = 'md', showTooltip = true, compact = false }) => {
  if (!badge) return null;

  const iconName = badge.icon || 'Award';
  const IconComponent = ICON_MAP[iconName] || Award;
  const colorClass = CATEGORY_COLORS[badge.category] || CATEGORY_COLORS.General;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div
      title={showTooltip ? `${badge.name}: ${badge.description}` : undefined}
      className={`inline-flex items-center rounded-full border shadow-sm transition-all hover:scale-105 select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${colorClass}`}
    >
      <IconComponent className={`${iconSizes[size] || iconSizes.md} flex-shrink-0`} />
      {!compact && <span>{badge.name}</span>}
    </div>
  );
};

export default BadgePill;
