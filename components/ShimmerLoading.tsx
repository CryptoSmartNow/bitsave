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

export const PageShimmer: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`w-full max-w-7xl mx-auto space-y-8 animate-pulse ${className}`}>
            {/* Header / Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-200/60 rounded-2xl relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/40">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                ))}
            </div>
            
            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-gray-200/60 rounded-3xl relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/40">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                    <div className="h-48 bg-gray-200/60 rounded-3xl relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/40">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="h-96 bg-gray-200/60 rounded-3xl relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/40">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TableShimmer: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="w-full space-y-4 animate-pulse">
            {/* Header */}
            <div className="h-10 bg-gray-200/60 rounded-xl w-full relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/40">
                 <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200/40 rounded-xl w-full relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/40">
                     <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
            ))}
        </div>
    );
};
