import React from 'react';

interface ShimmerLoaderProps {
  className?: string;
  type?: 'block' | 'text' | 'button' | 'circle';
}

export function ShimmerLoader({ className = '', type = 'block' }: ShimmerLoaderProps) {
  const baseClasses = "relative overflow-hidden bg-[#e2e8f0] isolate";
  const shimmerAnimation = "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";
  
  const typeClasses = {
    block: "w-full h-32 rounded-2xl",
    text: "w-full h-4 rounded-md",
    button: "w-full h-12 rounded-xl",
    circle: "w-12 h-12 rounded-full"
  };

  return (
    <div className={`${baseClasses} ${shimmerAnimation} ${typeClasses[type]} ${className}`} />
  );
}

// Ensure the animation is defined in your Tailwind config or globals.css
// keyframes: { shimmer: { '100%': { transform: 'translateX(100%)' } } }
