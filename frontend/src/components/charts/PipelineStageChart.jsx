import React from 'react';

const PipelineStageChart = ({
  title = 'Pipeline Stage',
  stages = [
    {
      id: 'qualified',
      label: 'Qualified',
      value: '$1.20M',
      color: '#3b82f6',
      stripeClass: 'stripe-fill-blue',
      barHeight: 56,
      sublabel: 'Foundations (94%)',
    },
    {
      id: 'proposal',
      label: 'Proposal',
      value: '$860K',
      color: '#06b6d4',
      stripeClass: 'stripe-fill-cyan',
      barHeight: 46,
      sublabel: 'Core Stack (78%)',
    },
    {
      id: 'negotiation',
      label: 'Negotiation',
      value: '$540K',
      color: '#8b5cf6',
      stripeClass: 'stripe-fill-purple',
      barHeight: 34,
      sublabel: 'Advanced AI (62%)',
    },
    {
      id: 'won',
      label: 'Won',
      value: '$284K',
      color: '#facc15',
      stripeClass: 'stripe-fill-amber',
      barHeight: 22,
      sublabel: 'Job Ready (38%)',
    },
  ],
}) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      {/* Title */}
      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '20px',
        }}
      >
        {title}
      </h3>

      {/* 4 Stages Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          alignItems: 'flex-end',
          minHeight: '160px',
          marginTop: 'auto',
        }}
      >
        {stages.map((stage) => (
          <div
            key={stage.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            {/* Header with vertical colored accent bar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '3px',
                    height: '14px',
                    backgroundColor: stage.color,
                    borderRadius: '2px',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {stage.label}
                </span>
              </div>

              {/* Big Bold Stage Metric */}
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginTop: '4px',
                  letterSpacing: '-0.02em',
                }}
              >
                {stage.value}
              </div>
            </div>

            {/* Striped Diagonal Bar */}
            <div
              className={stage.stripeClass}
              style={{
                width: '100%',
                height: `${stage.barHeight}px`,
                borderRadius: '6px',
                transition: 'height 0.4s ease',
                boxShadow: `0 4px 14px ${stage.color}22`,
                position: 'relative',
                overflow: 'hidden',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineStageChart;
