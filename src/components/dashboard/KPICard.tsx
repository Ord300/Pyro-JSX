import React from 'react';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
}

const colorMap = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20',  icon: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-900/40' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/40' },
  red:    { bg: 'bg-red-50 dark:bg-red-900/20',      icon: 'text-red-600 dark:text-red-400',     iconBg: 'bg-red-100 dark:bg-red-900/40' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',icon: 'text-purple-600 dark:text-purple-400',iconBg: 'bg-purple-100 dark:bg-purple-900/40' },
  cyan:   { bg: 'bg-cyan-50 dark:bg-cyan-900/20',    icon: 'text-cyan-600 dark:text-cyan-400',   iconBg: 'bg-cyan-100 dark:bg-cyan-900/40' },
};

export function KPICard({ title, value, icon: Icon, change, changeLabel = 'vs mois dernier', color = 'blue' }: KPICardProps) {
  const c = colorMap[color];
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', c.iconBg)}>
          <Icon className={cn('h-5 w-5', c.icon)} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1.5">
            {isPositive
              ? <TrendingUp className="h-4 w-4 text-green-500" />
              : <TrendingDown className="h-4 w-4 text-red-500" />}
            <span className={cn('text-sm font-semibold', isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-slate-400">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
