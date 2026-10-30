import React from 'react';
import { CategorySummary } from '../../types/finance.ts';
import { formatCurrency } from '../../utils/persianDate.ts';

interface CategoryDonutChartProps {
  categories: CategorySummary[];
  totalAmount: number;
  currencySymbol?: string;
  type?: 'expense' | 'income';
}

const PALETTE = [
  '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#64748b'
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalAmount,
  currencySymbol = 'تومان',
  type = 'expense'
}) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        تراکنشی در این بازه ثبت نشده است
      </div>
    );
  }

  // Calculate SVG stroke-dasharray and dashoffset for donut segments
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = categories.slice(0, 7).map((cat, idx) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (cat.percentage / 100) * circumference;
    return {
      ...cat,
      color: PALETTE[idx % PALETTE.length],
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut SVG */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] text-slate-400">مجموع {type === 'expense' ? 'مخارج' : 'درآمد'}</span>
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalAmount, currencySymbol, false)}
          </span>
          <span className="text-[10px] text-slate-400">{currencySymbol}</span>
        </div>
      </div>

      {/* Legend & Percentages */}
      <div className="flex-1 w-full space-y-2">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]">
                {seg.category}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono tabular-nums">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {formatCurrency(seg.amount, currencySymbol)}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 w-8 text-left">
                {seg.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
