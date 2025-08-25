"use client"
import { memo } from 'react';

const LoadingSpinner = memo(() => (
  <div className="text-center py-8">
    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full mx-auto mb-2"></div>
    <p className="text-gray-500">Loading...</p>
  </div>
))

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner