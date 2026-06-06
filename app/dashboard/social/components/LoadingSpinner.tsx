'use client';

import { memo } from 'react';
import { TableShimmer } from '@/components/ShimmerLoading';

const LoadingSpinner = memo(() => (
  <div className="w-full">
    <TableShimmer />
  </div>
))

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner