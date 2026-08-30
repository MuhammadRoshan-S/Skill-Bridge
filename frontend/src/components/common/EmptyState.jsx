import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title = 'No data found',
  description = 'Get started by creating your first entry.',
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '480px',
        margin: '20px auto',
        border: '1px dashed var(--border-medium)',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: '16px',
          }}
        >
          <Icon size={32} />
        </div>
      )}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          marginBottom: actionLabel ? '24px' : '0',
          maxWidth: '380px',
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} icon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
