import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const VelocityForecastChart = ({
  title = 'Skill Growth Velocity',
  viewFilter = 'Career Readiness',
  yAxisLabels = ['100%', '80%', '60%', '40%', '20%', '0%'],
  dataPoints = [
    { month: 'Jan', val: 420, label: 'Jan/26', sub: 'Readiness: 42%' },
    { month: 'Feb', val: 520, label: 'Feb/26', sub: 'Readiness: 52%' },
    { month: 'Mar', val: 610, label: 'Mar/26', sub: 'Readiness: 61%' },
    { month: 'Apr', val: 720, label: 'Apr/26', sub: 'Readiness: 72%' },
    { month: 'May', val: 780, label: 'May/26', sub: 'Readiness: 78%' },
    { month: 'Jun', val: 840, label: 'Jun/26', sub: 'Readiness: 84%' },
    { month: 'Jul', val: 910, label: 'Jul/26', sub: 'Target: 91%' },
  ],
  activeMonthIndex = 4, // May
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(activeMonthIndex);
  const [filter, setFilter] = useState(viewFilter);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterOptions = ['Career Readiness', 'Skill Verification', 'Interview Performance', 'Roadmap Progress'];

  const width = 640;
  const height = 280;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 35;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate points
  const points = dataPoints.map((dp, i) => {
    const x = paddingLeft + (i / (dataPoints.length - 1)) * chartWidth;
    const normalizedY = (dp.val / 1000) * chartHeight;
    const yTop = paddingTop + chartHeight - normalizedY;
    const yBottom = yTop + 65; // Band thickness
    return { x, yTop, yBottom, ...dp };
  });

  // Top curve path
  const topPath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.yTop}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.yTop;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.yTop;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.yTop}`;
  }, '');

  // Bottom curve path (reversed)
  const bottomPath = points
    .slice()
    .reverse()
    .reduce((acc, p, i, arr) => {
      if (i === 0) return `L ${p.x} ${p.yBottom}`;
      const prev = arr[i - 1];
      const cp1x = prev.x - (prev.x - p.x) / 2;
      const cp1y = prev.yBottom;
      const cp2x = prev.x - (prev.x - p.x) / 2;
      const cp2y = p.yBottom;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.yBottom}`;
    }, '');

  const bandAreaPath = `${topPath} ${bottomPath} Z`;

  const activePoint = points[hoveredIdx] || points[3];
  const colWidth = chartWidth / (dataPoints.length - 1);

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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

        {/* Dropdown Filter Pill */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-pill-dropdown"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <span>{filter}</span>
            <ChevronDown size={13} />
          </button>

          {showFilterDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#1c1e27',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 0',
                minWidth: '160px',
                zIndex: 40,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {filterOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setFilter(opt);
                    setShowFilterDropdown(false);
                  }}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    color: opt === filter ? '#fff' : 'var(--text-secondary)',
                    fontWeight: opt === filter ? 600 : 400,
                    cursor: 'pointer',
                    backgroundColor: opt === filter ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      opt === filter ? 'rgba(255,255,255,0.06)' : 'transparent')
                  }
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '480px' }}
        >
          <defs>
            {/* Diagonal Stripes Pattern (Violet/Purple) */}
            <pattern
              id="chartStripesPurple"
              width="14"
              height="14"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="14"
                stroke="rgba(168, 85, 247, 0.45)"
                strokeWidth="3.5"
              />
            </pattern>

            {/* Diagonal Stripes Pattern (Dark Base) */}
            <pattern
              id="chartStripesDark"
              width="14"
              height="14"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="14"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="3"
              />
            </pattern>

            {/* Glowing Gradient for Top Stroke */}
            <linearGradient id="curveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
            </linearGradient>

            {/* Active Column Vertical Highlight Gradient */}
            <linearGradient id="activeColGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.35)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.03)" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yAxisLabels.map((val, idx) => {
            const y = paddingTop + (chartHeight * (idx / (yAxisLabels.length - 1)));
            return (
              <g key={idx}>
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="#555966"
                  fontSize="11"
                  fontFamily="var(--font-sans)"
                  fontWeight="500"
                >
                  {val}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          {/* Active Highlight Pillar */}
          {activePoint && (
            <rect
              x={activePoint.x - colWidth / 2}
              y={paddingTop}
              width={colWidth}
              height={chartHeight}
              fill="url(#activeColGradient)"
              rx="4"
            />
          )}

          {/* Diagonal Striped Area Band */}
          <path d={bandAreaPath} fill="url(#chartStripesDark)" />
          <path d={bandAreaPath} fill="url(#chartStripesPurple)" opacity="0.65" />

          {/* Top & Bottom Line Curves */}
          <path d={topPath} fill="none" stroke="url(#curveGlow)" strokeWidth="2.5" />
          <path d={bottomPath.replace('L', 'M')} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

          {/* Interactive Month Vertical Grid Points & Connectors */}
          {points.map((p, i) => (
            <g
              key={i}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
            >
              {/* Connector line */}
              <line
                x1={p.x}
                y1={p.yTop}
                x2={p.x}
                y2={paddingTop + chartHeight}
                stroke={i === hoveredIdx ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.05)'}
                strokeDasharray="2 2"
              />

              {/* Point Dot */}
              <circle
                cx={p.x}
                cy={p.yTop}
                r={i === hoveredIdx ? '5' : '3.5'}
                fill={i === hoveredIdx ? '#a855f7' : '#7c3aed'}
                stroke="#0c0d12"
                strokeWidth="2"
              />

              {/* X-Axis Month Label */}
              <text
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                fill={i === hoveredIdx ? '#ffffff' : '#686d7c'}
                fontSize="12"
                fontWeight={i === hoveredIdx ? '700' : '500'}
                fontFamily="var(--font-sans)"
              >
                {p.month}
              </text>
            </g>
          ))}

          {/* Tooltip Pill above Active Month */}
          {activePoint && (
            <g
              transform={`translate(${activePoint.x}, ${Math.max(paddingTop - 15, activePoint.yTop - 45)})`}
              style={{ pointerEvents: 'none', transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <rect
                x="-46"
                y="-18"
                width="92"
                height="34"
                rx="8"
                fill="#20222a"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
                filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
              />
              <text
                x="0"
                y="-4"
                textAnchor="middle"
                fill="#9498a4"
                fontSize="9.5"
                fontFamily="var(--font-sans)"
                fontWeight="600"
              >
                {activePoint.label}
              </text>
              <text
                x="0"
                y="9"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontFamily="var(--font-sans)"
                fontWeight="700"
              >
                {activePoint.sub}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default VelocityForecastChart;
