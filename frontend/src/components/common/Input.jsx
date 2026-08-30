import React from 'react';

const Input = ({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '13px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}>
            <Icon size={15} strokeWidth={1.75} />
          </div>
        )}
        <input
          className={`input-field ${className}`}
          style={{
            paddingLeft: Icon ? '38px' : '14px',
            borderColor: error ? 'var(--danger)' : undefined,
            /* Override browser autofill */
            WebkitTextFillColor: 'var(--text-primary)',
            caretColor: 'var(--text-primary)',
            transition: 'background-color 9999s ease-in-out 0s, border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          {...props}
        />
      </div>
      {error ? (
        <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{helperText}</span>
      ) : null}
    </div>
  );
};

export default Input;
