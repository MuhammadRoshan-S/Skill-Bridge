import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const GlobalDemandMap = ({
  title = 'Sales By Countries',
  dropdownLabel = 'Top Countries',
  hubs = [
    { country: 'USA', flag: '🇺🇸', jobs: '7.2K', x: 23, y: 44 },
    { country: 'Canada', flag: '🇨🇦', jobs: '3.4K', x: 20, y: 32 },
    { country: 'France', flag: '🇫🇷', jobs: '4.8K', x: 50, y: 34 },
    { country: 'UK', flag: '🇬🇧', jobs: '5.9K', x: 47, y: 48 },
    { country: 'Germany', flag: '🇩🇪', jobs: '6.1K', x: 53, y: 42 },
    { country: 'India', flag: '🇮🇳', jobs: '18.4K', x: 70, y: 52 },
    { country: 'Japan', flag: '🇯🇵', jobs: '4.2K', x: 84, y: 45 },
  ],
}) => {
  const [filter, setFilter] = useState(dropdownLabel);
  const [showDropdown, setShowDropdown] = useState(false);

  const options = ['Top Countries', 'North America', 'Europe & UK', 'Asia Pacific', 'Remote Global'];

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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

        {/* Dropdown Filter */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-pill-dropdown"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>{filter}</span>
            <ChevronDown size={13} />
          </button>

          {showDropdown && (
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
                minWidth: '140px',
                zIndex: 40,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {options.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setFilter(opt);
                    setShowDropdown(false);
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

      {/* Dotted Dark Map Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#111319',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* World Map SVG with Dotted Grid */}
        <svg
          viewBox="0 0 1000 500"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            opacity: 0.45,
          }}
        >
          <defs>
            <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#323646" />
            </pattern>
          </defs>

          {/* Stylized Continents filled with dotted pattern */}
          {/* North America */}
          <path
            d="M 120 80 Q 200 60 280 120 T 320 220 T 260 270 T 180 230 T 100 160 Z"
            fill="url(#dotPattern)"
          />
          {/* South America */}
          <path
            d="M 270 280 Q 320 300 340 370 T 300 450 T 250 420 T 260 320 Z"
            fill="url(#dotPattern)"
          />
          {/* Europe */}
          <path
            d="M 440 90 Q 520 80 560 140 T 520 200 T 450 170 Z"
            fill="url(#dotPattern)"
          />
          {/* Africa */}
          <path
            d="M 460 210 Q 540 220 560 300 T 520 400 T 470 380 T 440 280 Z"
            fill="url(#dotPattern)"
          />
          {/* Asia */}
          <path
            d="M 570 90 Q 750 70 850 160 T 820 280 T 670 260 T 580 170 Z"
            fill="url(#dotPattern)"
          />
          {/* Australia */}
          <path
            d="M 780 340 Q 860 330 890 380 T 840 440 T 770 410 Z"
            fill="url(#dotPattern)"
          />
        </svg>

        {/* Dynamic Country Flag Badges */}
        {hubs.map((hub, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${hub.x}%`,
              top: `${hub.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: hub.jobs ? '3px 8px 3px 5px' : '4px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(28, 30, 39, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                backgroundColor: '#1f222d',
              }}
            >
              {hub.flag}
            </span>
            {hub.jobs && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {hub.jobs}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalDemandMap;
