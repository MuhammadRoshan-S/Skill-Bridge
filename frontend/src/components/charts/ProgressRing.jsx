import React from 'react';

const ProgressRing = ({
  radius = 58,
  stroke = 8,
  progress = 75,
  color = '#4ade80',
  gradientId = 'ringGradient',
  label = '',
  sublabel = '',
  size = 135,
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg height={size} width={size} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        {/* Background Track */}
        <circle
          stroke="#20232c"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Fill */}
        <circle
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            strokeLinecap: 'round',
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Center Label */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: size > 120 ? '1.8rem' : '1.3rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {Math.round(progress)}%
        </span>
        {label && (
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </span>
        )}
      </div>
      {sublabel && (
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
            textAlign: 'center',
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
};

export default ProgressRing;
