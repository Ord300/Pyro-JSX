"use client";

import React from "react";
import { cn } from "@/src/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "cyan";
}

const colorMap = {
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/40" },
  green: { bg: "bg-green-50 dark:bg-green-900/20", icon: "text-green-600 dark:text-green-400", iconBg: "bg-green-100 dark:bg-green-900/40" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/40" },
  red: { bg: "bg-red-50 dark:bg-red-900/20", icon: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/40" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-100 dark:bg-purple-900/40" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-900/20", icon: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-cyan-100 dark:bg-cyan-900/40" },
};

export function KPICard({ title, value, icon: Icon, change, changeLabel = "vs mois dernier", color = "blue" }: KPICardProps) {
  const c = colorMap[color];
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5")}>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-1 text-xl font-extrabold leading-tight text-slate-900 dark:text-white">{value}</p>
        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1">
            {isPositive
              ? <TrendingUp className="h-3 w-3 text-green-500" />
              : <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={cn("text-xs font-semibold", isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              {isPositive ? "+" : ""}{change}%
            </span>
            <span className="hidden text-[11px] text-slate-400 xl:inline">{changeLabel}</span>
          </div>
        )}
      </div>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", c.iconBg)}>
        <Icon className={cn("h-4 w-4", c.icon)} />
      </div>
    </div>
  );
}
