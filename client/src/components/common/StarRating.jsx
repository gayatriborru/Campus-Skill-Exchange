import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  count,
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(maxStars)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.round(rating);

          return (
            <button
              type="button"
              key={i}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              } p-0 bg-transparent border-0 focus:outline-none`}
            >
              <Star
                className={`${currentSize} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.4)]'
                    : 'text-slate-300 fill-transparent'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-slate-700 ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-xs text-slate-400">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
