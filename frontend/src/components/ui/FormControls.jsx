import React, { useState } from 'react';
import { Icon } from '../Icons.jsx';

export function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  placeholder,
  required = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || name;

  return (
    <div className={`evoq-form-group ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="evoq-label">
          {label} {required && <span className="evoq-lime">*</span>}
        </label>
      )}
      <div className="evoq-input-wrap">
        {icon && (
          <span className="evoq-input-icon-left">
            <Icon name={icon} size={16} />
          </span>
        )}
        <input
          id={inputId}
          name={name || inputId}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`evoq-input ${icon ? 'has-icon-left' : ''} ${
            isPassword || iconRight ? 'has-icon-right' : ''
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="evoq-input-icon-btn"
            tabIndex="-1"
            aria-label={showPassword ? 'Hide value' : 'Show value'}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
          </button>
        ) : iconRight ? (
          <span className="evoq-input-icon-right">
            <Icon name={iconRight} size={16} />
          </span>
        ) : null}
      </div>
      {error && (
        <span id={`${inputId}-error`} className="evoq-input-error-msg" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="evoq-input-helper-text">{helperText}</span>
      )}
    </div>
  );
}

export function Select({
  label,
  id,
  name,
  value,
  onChange,
  error,
  helperText,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const selectId = id || name;

  return (
    <div className={`evoq-form-group ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="evoq-label">
          {label} {required && <span className="evoq-lime">*</span>}
        </label>
      )}
      <div className="evoq-select-wrap">
        <select
          id={selectId}
          name={name || selectId}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="evoq-select"
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={optVal} value={optVal}>
                    {optLabel}
                  </option>
                );
              })
            : children}
        </select>
        <span className="evoq-select-arrow" aria-hidden="true">
          <Icon name="chevron-down" size={14} />
        </span>
      </div>
      {error && <span className="evoq-input-error-msg">{error}</span>}
      {!error && helperText && <span className="evoq-input-helper-text">{helperText}</span>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  name,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const textareaId = id || name;

  return (
    <div className={`evoq-form-group ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={textareaId} className="evoq-label">
          {label} {required && <span className="evoq-lime">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name || textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className="evoq-textarea"
        aria-invalid={!!error}
        {...props}
      />
      {error && <span className="evoq-input-error-msg">{error}</span>}
      {!error && helperText && <span className="evoq-input-helper-text">{helperText}</span>}
    </div>
  );
}

export function Checkbox({
  label,
  id,
  name,
  checked,
  onChange,
  disabled = false,
  description,
  className = '',
  ...props
}) {
  const checkId = id || name;

  return (
    <label
      htmlFor={checkId}
      className={`evoq-checkbox-label ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
    >
      <input
        type="checkbox"
        id={checkId}
        name={name || checkId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="evoq-checkbox-input"
        {...props}
      />
      <span className="evoq-checkbox-custom" aria-hidden="true">
        {checked && <Icon name="check" size={12} />}
      </span>
      <div className="evoq-checkbox-text">
        <span className="evoq-checkbox-title">{label}</span>
        {description && <span className="evoq-checkbox-desc">{description}</span>}
      </div>
    </label>
  );
}

export function RadioGroup({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  orientation = 'vertical', // 'vertical' | 'horizontal'
  className = '',
}) {
  return (
    <div className={`evoq-form-group ${className}`.trim()}>
      {label && <span className="evoq-label">{label}</span>}
      <div className={`evoq-radio-group evoq-radio-${orientation}`}>
        {options.map((opt) => {
          const optVal = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const optDesc = typeof opt === 'object' ? opt.description : null;
          const isSelected = value === optVal;
          const optId = `${name}-${optVal}`;

          return (
            <label
              key={optVal}
              htmlFor={optId}
              className={`evoq-radio-label ${isSelected ? 'is-selected' : ''} ${
                disabled ? 'is-disabled' : ''
              }`}
            >
              <input
                type="radio"
                id={optId}
                name={name}
                value={optVal}
                checked={isSelected}
                onChange={() => onChange(optVal)}
                disabled={disabled}
                className="evoq-radio-input"
              />
              <span className="evoq-radio-custom" aria-hidden="true" />
              <div className="evoq-radio-text">
                <span className="evoq-radio-title">{optLabel}</span>
                {optDesc && <span className="evoq-radio-desc">{optDesc}</span>}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  description,
  className = '',
}) {
  return (
    <div className={`evoq-toggle-row ${disabled ? 'is-disabled' : ''} ${className}`.trim()}>
      <div className="evoq-toggle-text">
        {label && <span className="evoq-toggle-label">{label}</span>}
        {description && <span className="evoq-toggle-desc">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`evoq-toggle-switch ${checked ? 'is-active' : ''}`}
      >
        <span className="evoq-toggle-thumb" />
      </button>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search tournaments, teams, players...',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`evoq-search-wrap ${className}`.trim()}>
      <span className="evoq-search-icon" aria-hidden="true">
        <Icon name="search" size={16} />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="evoq-search-input"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="evoq-search-clear-btn"
          aria-label="Clear search"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

export function FormField({
  label,
  id,
  required = false,
  error,
  helperText,
  children,
  className = '',
}) {
  return (
    <div className={`evoq-form-group ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="evoq-label">
          {label} {required && <span className="evoq-lime">*</span>}
        </label>
      )}
      {children}
      {error && (
        <span id={id ? `${id}-error` : undefined} className="evoq-form-error" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && <span className="evoq-form-helper">{helperText}</span>}
    </div>
  );
}


