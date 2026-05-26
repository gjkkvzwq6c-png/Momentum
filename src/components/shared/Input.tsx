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

const base = 'w-full border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors text-sm';

const inlineBase: React.CSSProperties = {
  background: 'var(--bg-input)',
  borderColor: 'var(--border-input)',
  color: 'var(--text-1)',
};

export function Input({ label, className = '', style, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">{label}</label>}
      <input className={`${base} ${className}`} style={{ ...inlineBase, ...style }} {...props} />
    </div>
  );
}

export function Textarea({ label, className = '', style, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">{label}</label>}
      <textarea className={`${base} resize-none ${className}`} style={{ ...inlineBase, ...style }} {...props} />
    </div>
  );
}

export function Select({ label, children, className = '', style, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">{label}</label>}
      <select className={`${base} ${className}`} style={{ ...inlineBase, ...style }} {...props}>
        {children}
      </select>
    </div>
  );
}
