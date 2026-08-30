import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, LogOut, User as UserIcon, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* Map route paths → human-readable page names */
const PAGE_TITLES = {
  '/dashboard':       'Overview',
  '/resume-analyzer': 'Resume Analyzer',
  '/skill-gap':       'Skill Gap Analysis',
  '/roadmap':         'Learning Roadmap',
  '/jobs':            'Job Matches',
  '/interview-prep':  'Interview Prep',
  '/progress':        'Career Analytics',
  '/profile':         'My Profile',
  '/settings':        'Settings',
};

const Navbar = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu]     = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || 'SkillBridge';

  const displayName = user?.user?.first_name
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim()
    : user?.user?.username || 'User';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="app-topbar">

      {/* ── Left: Mobile Toggle + Breadcrumb ─────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-menu-btn"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'none',
          }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}>
            SkillBridge
          </span>
          <ChevronRight size={12} color="var(--text-muted)" strokeWidth={1.5} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            {pageTitle}
          </span>
        </div>
      </div>

      {/* ── Right: Notification Bell + Profile Avatar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-pill)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-card)';
            }}
          >
            <Bell size={16} />
            {/* Live dot */}
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)',
            }} />
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '300px',
              background: '#141416',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 60,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}>
                  Notifications
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'var(--primary-bg)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--primary-border)',
                }}>
                  2 New
                </span>
              </div>

              {[
                { title: 'AI Roadmap Updated', desc: '3 new modules added for your target role.' },
                { title: 'Resume ATS Scored',  desc: 'Score improved to 88% after keyword boost.' },
              ].map((n, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid var(--border-card)',
                  marginBottom: i === 0 ? '8px' : 0,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '3px',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      flexShrink: 0,
                      display: 'block',
                    }} />
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {n.title}
                    </p>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>
                    {n.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#08080a',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}
          >
            {initials}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '220px',
              background: '#141416',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '6px',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 60,
            }}>
              {/* User info */}
              <div style={{
                padding: '10px 12px',
                marginBottom: '4px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}>
                  {displayName}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {user?.target_role_title || 'Software Engineer'}
                </p>
              </div>

              <div className="divider" style={{ margin: '0 6px 4px' }} />

              {[
                { to: '/profile',  icon: UserIcon,     label: 'My Profile' },
                { to: '/settings', icon: SettingsIcon, label: 'Settings'   },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.835rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {label}
                </Link>
              ))}

              <div className="divider" style={{ margin: '4px 6px' }} />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: '0.835rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} strokeWidth={1.75} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
