/**
 * Shimmer Loading Effect Component
 * 
 * A modern, animated shimmer effect for loading states
 */

import React from 'react';

interface ShimmerCardProps {
    className?: string;
}

export const ShimmerCard: React.FC<ShimmerCardProps> = ({ className = '' }) => {
    return (
        <div className={`relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 p-6 ${className}`}>
            {/* Shimmer animation overlay */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200/60 rounded-xl animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-gray-200/60 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-gray-200/60 rounded animate-pulse" />
                    </div>
                </div>
                <div className="h-10 w-24 bg-gray-200/60 rounded-xl animate-pulse" />
            </div>

            {/* Progress bars skeleton */}
            <div className="space-y-4 mb-6">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-200/60 rounded animate-pulse" />
                        <div className="h-4 w-12 bg-gray-200/60 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-full bg-gray-200/60 rounded-full animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-24 bg-gray-200/60 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200/60 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-full bg-gray-200/60 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Info row skeleton */}
            <div className="flex justify-between mb-4">
                <div className="h-4 w-32 bg-gray-200/60 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200/60 rounded animate-pulse" />
            </div>

            {/* Button skeleton */}
            <div className="h-12 w-full bg-gray-200/60 rounded-xl animate-pulse" />
        </div>
    );
};

export const ShimmerList: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="flex flex-col gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <ShimmerCard key={index} />
            ))}
        </div>
    );
};
