import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading data...' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-600`} />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};
