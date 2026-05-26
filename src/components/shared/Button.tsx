import React from 'react';
import { motion } from 'framer-motion';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white',
  secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
  ghost: 'hover:bg-white/8 text-gray-300 hover:text-white',
  danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`font-semibold transition-all duration-150 ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-40 disabled:cursor-not-allowed`}
      {...props as any}
    >
      {children}
    </motion.button>
  );
}
