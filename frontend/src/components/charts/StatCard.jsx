import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'confidence'
  trendLabel,
  onClick,
  icon: Icon,
  accentColor,          // optional override e.g. 'var(--neon-green)'
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`glass-panel glass-panel-hover ${className}`}
      onClick={onClick}
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '136px',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Subtle amber glow spot in top-right corner */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle at 100% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Top Row: Title + Arrow ─────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'var(--primary-bg)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={14} color="var(--primary)" strokeWidth={2} />
            </div>
          )}
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {title}
          </span>
        </div>
        <div style={{
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
          flexShrink: 0,
        }}>
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* ── Metric Value + Trend ─────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.1rem',
            fontWeight: 700,
            color: accentColor || 'var(--text-primary)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            {value}
          </span>

          {trend && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              {trendDirection === 'up' && (
                <span className="trend-badge-up">↑ {trend}</span>
              )}
              {trendDirection === 'down' && (
                <span className="trend-badge-down">↓ {trend}</span>
              )}
              {trendDirection === 'confidence' && (
                <span className="trend-badge-confidence">{trend} conf.</span>
              )}
              {trendLabel && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {subtitle && (
          <span style={{
            fontSize: '0.745rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            letterSpacing: '0.01em',
          }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
