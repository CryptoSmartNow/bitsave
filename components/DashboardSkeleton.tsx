import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-32 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-24 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
              <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded-lg"></div>
              <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Chart/Table Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-20 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 rounded-lg"></div>
                  <div className="h-3 w-1/2 bg-slate-200 rounded-lg"></div>
                </div>
                <div className="h-4 w-16 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-[400px]">
          <div className="h-6 w-32 bg-slate-200 rounded-lg mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-200 rounded-lg"></div>
                <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
