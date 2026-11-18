export default function FormField({ label, id, error, hint, required = false, as = 'input', children, className = '', ...props }) {
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;
  const fieldClassName = ['field', className].filter(Boolean).join(' ');
  const commonProps = {
    id,
    required: required || undefined,
    'aria-describedby': describedBy,
    'aria-invalid': error ? 'true' : undefined,
    ...props,
  };

  return (
    <div className={fieldClassName}>
      <label htmlFor={id}>
        {label} {required ? <span className="required-marker" aria-hidden="true">*</span> : null}
      </label>
      {as === 'textarea' ? <textarea {...commonProps}>{children}</textarea> : null}
      {as === 'select' ? <select {...commonProps}>{children}</select> : null}
      {as === 'input' ? <input {...commonProps} /> : null}
      {hint ? <span className="field-hint" id={hintId}>{hint}</span> : null}
      {error ? <span className="field-error" id={errorId} role="alert">{error}</span> : null}
    </div>
  );
}
