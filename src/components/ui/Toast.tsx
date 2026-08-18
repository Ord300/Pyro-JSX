import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  return (
    <div className={cn(
      "pointer-events-auto flex w-full max-w-sm items-center space-x-4 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 transition-all"
    )}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-50">
        {message}
      </div>
      <div className="flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => onClose(id)} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Simple Toast Container for Phase 1 demo
export function ToastContainer({ toasts, onClose }: { toasts: Omit<ToastProps, 'onClose'>[], onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-6 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
