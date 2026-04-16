import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className }) {
  return (
    <div className={twMerge("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={twMerge("px-6 py-4 border-b border-gray-50 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={twMerge("p-6", className)}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, type = "button", variant = "primary", className, icon: Icon, disabled, loading }) {
  const variants = {
    primary: "bg-primary text-white hover:bg-indigo-700 shadow-indigo-100",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-100",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={twMerge(
        "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </button>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <input
        className={twMerge(
          "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-white transition-all text-sm shadow-sm",
          error && "border-red-500 focus:border-red-500"
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
