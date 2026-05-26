import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

const base = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors text-sm';

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">{label}</label>}
      <input className={`${base} ${className}`} {...props} />
    </div>
  );
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">{label}</label>}
      <textarea className={`${base} resize-none ${className}`} {...props} />
    </div>
  );
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">{label}</label>}
      <select className={`${base} ${className}`} style={{ background: '#111118' }} {...props}>
        {children}
      </select>
    </div>
  );
}
