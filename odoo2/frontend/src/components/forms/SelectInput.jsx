import React from 'react';

export const SelectInput = ({
  label,
  id,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`block w-full rounded-lg border text-sm transition-colors py-2 px-3 bg-white ${
          error
            ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30'
            : 'border-slate-200 text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 hover:border-slate-300'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
