export default function FormInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
}) {
  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className="form-input"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} className="form-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

