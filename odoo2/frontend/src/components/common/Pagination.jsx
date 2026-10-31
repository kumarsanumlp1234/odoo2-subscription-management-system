import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 20,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startRecord = currentPage * pageSize + 1;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 sm:px-6 rounded-b-xl">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{startRecord}</span> to{' '}
            <span className="font-semibold text-slate-700">{endRecord}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalElements}</span> entries
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-1.5 rounded-l-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="relative inline-flex items-center px-4 py-1.5 border-t border-b border-slate-200 bg-white text-xs font-semibold text-slate-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-1.5 rounded-r-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
