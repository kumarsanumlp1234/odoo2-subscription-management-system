import React from 'react';

export const FormInput = ({
  label,
  id,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`block w-full rounded-lg border text-sm transition-colors py-2 px-3 ${
            Icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30'
              : 'border-slate-200 text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white hover:border-slate-300'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
