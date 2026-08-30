import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Bell,
  Moon,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    roadmapReminders: true,
    interviewFeedback: true,
    jobMatches: true,
  });
  const [savedMsg, setSavedMsg] = useState('');

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = () => {
    setSavedMsg('Settings saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Platform Settings & AI Calibration
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Configure your AI engine parameters, notifications, security, and account preferences.
          </p>
        </div>

        {savedMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--neon-green-bg)',
              color: 'var(--neon-green)',
              border: '1px solid var(--neon-green-border)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{savedMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* AI Engine Status */}
          <Card title="AI Intelligence Engine" subtitle="Backend LLM configuration" icon={Sparkles}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#111218',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Google Gemini 3.5 Flash Lite</span>
                    <Badge variant="success">Primary</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Failover Backup: <strong>Gemini 3.1 Flash Lite</strong></span>
                    <Badge variant="primary">Auto-Failover</Badge>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Configured with automatic rate-limit (429) failover & resilient caching
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <p>
                  SkillBridge uses server-side AI agents for resume parsing, ATS scoring, gap analysis, and mock interviews. All keys remain safely on the Django REST backend.
                </p>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card title="Notification Preferences" subtitle="Stay updated on your growth" icon={Bell}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  key: 'roadmapReminders',
                  label: 'Roadmap Milestone Reminders',
                  desc: 'Weekly nudges to maintain study momentum',
                },
                {
                  key: 'interviewFeedback',
                  label: 'Interview AI Feedback Reports',
                  desc: 'Receive immediate breakdown on answered questions',
                },
                {
                  key: 'jobMatches',
                  label: 'Smart Job Match Alerts',
                  desc: 'When new positions match >75% of your skills',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#111218',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.label}
                    </h4>
                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => handleToggle(item.key)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--text-primary)', cursor: 'pointer' }}
                  />
                </div>
              ))}

              <Button variant="secondary" onClick={handleSaveSettings} style={{ marginTop: '6px' }}>
                Save Preferences
              </Button>
            </div>
          </Card>

          {/* Appearance */}
          <Card title="Display & Theme" subtitle="Custom UI styling" icon={Moon}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#111218',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Stealth Matte Charcoal</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Deep graphite canvas with striped charts and neon lime & violet telemetry
                  </p>
                </div>
                <Badge variant="primary">Active</Badge>
              </div>
            </div>
          </Card>

          {/* Account Security & Sign Out */}
          <Card title="Account Actions" subtitle="Session & security control" icon={Shield}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{user?.user?.username}</strong> ({user?.user?.email})
              </p>

              <Button
                variant="danger"
                icon={LogOut}
                onClick={logout}
                style={{ marginTop: '4px' }}
              >
                Sign Out of SkillBridge
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
