'use client'

import { useRef, useEffect, ReactNode } from 'react';

interface OptimizedSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

export default function OptimizedSection({ children, id, className = '' }: OptimizedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    // Use Intersection Observer to optimize rendering
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // Add or remove optimize-scroll class based on visibility
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.classList.remove('optimize-scroll');
          } else {
            // Only optimize when far from viewport
            if (Math.abs(entry.boundingClientRect.top) > window.innerHeight * 2) {
              entry.target.classList.add('optimize-scroll');
              entry.target.classList.remove('is-visible');
            }
          }
        });
      },
      {
        rootMargin: '200px 0px 200px 0px', // Load content before it's visible
        threshold: 0.01
      }
    );
    
    observer.observe(sectionRef.current);
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section 
      ref={sectionRef} 
      id={id} 
      className={`${className} will-change-transform`}
      style={{ 
        transform: 'translateZ(0)',  // Force GPU acceleration
      }}
    >
      {children}
    </section>
  );
}