import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'primary', // 'primary' | 'cyan' | 'purple' | 'amber' | 'green' | 'danger'
  striped = false,
  showLabel = false,
  height = '8px',
  label = '',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantColors = {
    primary: '#ffffff',
    cyan: '#38bdf8',
    purple: '#a855f7',
    amber: '#facc15',
    green: '#4ade80',
    danger: '#f87171',
  };

  const stripeClasses = {
    primary: 'stripe-fill-blue',
    cyan: 'stripe-fill-cyan',
    purple: 'stripe-fill-purple',
    amber: 'stripe-fill-amber',
    green: 'stripe-fill-green',
  };

  return (
    <div style={{ width: '100%' }} className={className}>
      {(showLabel || label) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '6px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{label}</span>
          <span style={{ color: 'var(--text-primary)' }}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: '#12141a',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className={striped ? stripeClasses[variant] || 'stripe-fill-purple' : ''}
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: !striped ? variantColors[variant] || '#ffffff' : undefined,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
