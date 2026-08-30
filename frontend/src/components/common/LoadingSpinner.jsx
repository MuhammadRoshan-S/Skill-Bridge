import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md', fullScreen = false }) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  const spinnerSize = sizeMap[size] || 40;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '32px',
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: '3px solid rgba(99, 102, 241, 0.15)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
        }}
      />
      {message && (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          zIndex: 999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
