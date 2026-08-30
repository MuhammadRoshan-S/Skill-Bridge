import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const SpeedometerGauge = ({
  title = 'Repeat Customer Rate',
  value = 65,
  target = 80,
  targetText = 'On track for 80% target',
  onActionClick,
}) => {
  // Generate 36 ticks around an arc from -210 deg to 30 deg (240 deg total span)
  const totalTicks = 38;
  const activeCount = Math.round((Math.min(100, Math.max(0, value)) / 100) * totalTicks);
  const startAngle = -210;
  const endAngle = 30;
  const angleRange = endAngle - startAngle;

  const radiusInner = 72;
  const radiusOuter = 95;
  const centerX = 130;
  const centerY = 120;

  const ticks = Array.from({ length: totalTicks }).map((_, i) => {
    const angleDeg = startAngle + (i / (totalTicks - 1)) * angleRange;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x1 = centerX + radiusInner * Math.cos(angleRad);
    const y1 = centerY + radiusInner * Math.sin(angleRad);
    const x2 = centerX + radiusOuter * Math.cos(angleRad);
    const y2 = centerY + radiusOuter * Math.sin(angleRad);

    const isActive = i < activeCount;
    // Color interpolation from Cyan (#06b6d4) to Lime Green (#4ade80)
    const ratio = i / totalTicks;
    let strokeColor = '#22242e'; // inactive tick

    if (isActive) {
      if (ratio < 0.25) {
        strokeColor = '#06b6d4'; // Cyan
      } else if (ratio < 0.5) {
        strokeColor = '#10b981'; // Emerald
      } else if (ratio < 0.8) {
        strokeColor = '#22c55e'; // Green
      } else {
        strokeColor = '#4ade80'; // Lime
      }
    }

    return {
      x1,
      y1,
      x2,
      y2,
      strokeColor,
      isActive,
    };
  });

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <button
          onClick={onActionClick}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Speedometer Radial Gauge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '4px 0 10px' }}>
        <div style={{ position: 'relative', width: '260px', height: '170px' }}>
          <svg viewBox="0 0 260 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Segmented Radial Ticks */}
            {ticks.map((tick, i) => (
              <line
                key={i}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={tick.strokeColor}
                strokeWidth="3.2"
                strokeLinecap="round"
                style={{
                  transition: 'stroke 0.3s ease',
                  filter: tick.isActive ? 'url(#gaugeGlow)' : 'none',
                }}
              />
            ))}
          </svg>

          {/* Centered Percentage & Subtitle */}
          <div
            style={{
              position: 'absolute',
              top: '55px',
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {value}%
            </span>
            <span
              style={{
                fontSize: '0.775rem',
                color: 'var(--text-muted)',
                marginTop: '6px',
                fontWeight: 500,
              }}
            >
              {targetText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedometerGauge;
