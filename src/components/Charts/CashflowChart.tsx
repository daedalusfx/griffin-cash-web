import React, { useState } from 'react';
import { MonthlyReportItem } from '../../types/finance.ts';
import { formatCurrency, formatPersianDate } from '../../utils/persianDate.ts';

interface CashflowChartProps {
  data: MonthlyReportItem[];
  currencySymbol?: string;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ data, currencySymbol = 'تومان' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        داده‌ای برای نمایش نمودار ماهانه موجود نیست
      </div>
    );
  }

  // Calculate scales
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense, Math.abs(d.net))), 1000000);
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 25;
  const effectiveWidth = chartWidth - paddingX * 2;
  const effectiveHeight = chartHeight - paddingY * 2;

  const stepX = data.length > 1 ? effectiveWidth / (data.length - 1) : effectiveWidth / 2;

  // Build points for Net Cashflow Line
  const netPoints = data.map((d, i) => {
    const x = paddingX + i * stepX;
    // Map net: 0 is at middle or bottom? Let's map 0 to maxVal
    const normalizedY = (d.net / maxVal);
    // Let's place 0 at bottom if all positive, or mid if negative
    const y = chartHeight - paddingY - Math.max(0, (d.income / maxVal) * effectiveHeight);
    return { x, y, net: d.net };
  });

  return (
    <div className="w-full select-none" dir="ltr">
      <div className="flex items-center justify-between mb-4 px-2" dir="rtl">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
            <span>درآمد (واریزی)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
            <span>مخارج (هزینه‌ها)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-indigo-500 inline-block rounded-full" />
            <span>تراز خالص نقدینگی</span>
          </div>
        </div>

        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="text-xs text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{data[hoveredIdx].key}</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(data[hoveredIdx].income, currencySymbol)}</span>
            <span>·</span>
            <span className="text-rose-600 dark:text-rose-400">-{formatCurrency(data[hoveredIdx].expense, currencySymbol)}</span>
            <span>·</span>
            <span className={data[hoveredIdx].net >= 0 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-amber-600 font-bold'}>
              خالص: {formatCurrency(data[hoveredIdx].net, currencySymbol)}
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
          style={{ minWidth: '550px' }}
        >
          <defs>
            <linearGradient id="netAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - paddingY - ratio * effectiveHeight;
            const labelVal = Math.round(ratio * maxVal);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800 stroke-1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono tabular-nums"
                >
                  {(labelVal / 1000000).toFixed(0)}M
                </text>
              </g>
            );
          })}

          {/* Grouped Bars: Income & Expense */}
          {data.map((item, idx) => {
            const groupX = paddingX + idx * stepX;
            const barWidth = Math.min(22, stepX * 0.35);
            const incHeight = Math.max(2, (item.income / maxVal) * effectiveHeight);
            const expHeight = Math.max(2, (item.expense / maxVal) * effectiveHeight);
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.key}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity duration-150"
                opacity={hoveredIdx !== null && !isHovered ? 0.45 : 1}
              >
                {/* Background hover highlight column */}
                {isHovered && (
                  <rect
                    x={groupX - stepX / 2 + 4}
                    y={paddingY}
                    width={stepX - 8}
                    height={chartHeight - paddingY * 2}
                    fill="currentColor"
                    className="text-slate-100/70 dark:text-slate-800/60"
                    rx={4}
                  />
                )}

                {/* Income Bar */}
                <rect
                  x={groupX - barWidth - 2}
                  y={chartHeight - paddingY - incHeight}
                  width={barWidth}
                  height={incHeight}
                  fill="#10b981"
                  rx={2}
                  className="transition-all duration-200 hover:brightness-110"
                />

                {/* Expense Bar */}
                <rect
                  x={groupX + 2}
                  y={chartHeight - paddingY - expHeight}
                  width={barWidth}
                  height={expHeight}
                  fill="#f43f5e"
                  rx={2}
                  className="transition-all duration-200 hover:brightness-110"
                />

                {/* Month label */}
                <text
                  x={groupX}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-mono tabular-nums transition-colors ${
                    isHovered ? 'fill-indigo-600 dark:fill-indigo-400 font-bold' : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {item.key.slice(5)}/{item.key.slice(2, 4)}
                </text>
              </g>
            );
          })}

          {/* Net Cashflow Line Overlay */}
          {data.length > 1 && (
            <path
              d={data
                .map((d, i) => {
                  const x = paddingX + i * stepX;
                  // Clamp net to fit within visual box
                  const posNet = Math.max(0, d.net);
                  const y = chartHeight - paddingY - (posNet / maxVal) * effectiveHeight;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Net Cashflow Data dots */}
          {data.map((d, i) => {
            const x = paddingX + i * stepX;
            const posNet = Math.max(0, d.net);
            const y = chartHeight - paddingY - (posNet / maxVal) * effectiveHeight;
            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3.5}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
