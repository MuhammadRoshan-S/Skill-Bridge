import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
  hoverEffect = false,
  noPadding = false,
  style = {},
  ...props
}) => {
  return (
    <div
      className={`glass-panel ${hoverEffect ? 'glass-panel-hover' : ''} ${className}`}
      style={{
        padding: noPadding ? 0 : '22px 24px',
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      {(title || subtitle || action || Icon) && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '18px',
          gap: '12px',
        }}>
          {/* Left: Icon + Title + Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {Icon && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-bg)',
                border: '1px solid var(--primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={15} color="var(--primary)" strokeWidth={1.75} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              {title && (
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '3px',
                  letterSpacing: '0.01em',
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Action slot */}
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
