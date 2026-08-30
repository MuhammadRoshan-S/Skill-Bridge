import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.825rem' },
    md: { padding: '10px 18px', fontSize: '0.925rem' },
    lg: { padding: '14px 26px', fontSize: '1.05rem' },
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      style={sizeStyles[size]}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="animate-spin"
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
          }}
        />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 17} />
      )}
      {children}
    </button>
  );
};

export default Button;
