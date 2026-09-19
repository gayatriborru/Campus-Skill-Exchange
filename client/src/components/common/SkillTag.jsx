import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';

const SkillTag = ({
  skill,
  type = 'teach',
  proficiency,
  onRemove,
  clickable = false,
  onClick,
  size = 'md',
}) => {
  const isTeach = type === 'teach';
  const skillName = typeof skill === 'string' ? skill : skill?.name || 'Unknown';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      onClick={clickable ? onClick : undefined}
      className={`inline-flex items-center rounded-lg border transition-all ${
        clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${sizeClasses[size] || sizeClasses.md} ${
        isTeach
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300'
          : 'bg-brand-50 text-brand-800 border-brand-200 hover:border-brand-300'
      }`}
    >
      {isTeach ? (
        <Sparkles className="w-3 h-3 text-emerald-600 flex-shrink-0" />
      ) : (
        <BookOpen className="w-3 h-3 text-brand-600 flex-shrink-0" />
      )}
      <span>{skillName}</span>

      {proficiency && (
        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full ${
            isTeach ? 'bg-emerald-200/60 text-emerald-900' : 'bg-brand-200/60 text-brand-900'
          }`}
        >
          {proficiency}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white/80 p-0.5 transition-colors"
          title="Remove skill"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default SkillTag;
