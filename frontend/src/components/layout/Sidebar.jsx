import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Target,
  Compass,
  MessagesSquare,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Search,
  Zap,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Overview',       path: '/dashboard',       icon: LayoutDashboard },
      { label: 'Resume AI',      path: '/resume-analyzer', icon: FileText },
      { label: 'Skill Gap',      path: '/skill-gap',       icon: Target },
      { label: 'Roadmap',        path: '/roadmap',         icon: Compass },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Interview Prep', path: '/interview-prep',  icon: MessagesSquare },
      { label: 'Analytics',      path: '/progress',        icon: TrendingUp },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Profile',     path: '/profile',         icon: User },
      { label: 'Settings',       path: '/settings',        icon: Settings },
    ],
  },
];

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user?.first_name
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim()
    : user?.user?.username || 'User';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const targetRole = user?.target_role_title || 'Target Role Not Set';

  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <aside className={`app-sidebar${isMobileOpen ? ' mobile-open' : ''}`}>

      {/* ── Brand Header ─────────────────────────────── */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          {/* Logo mark - Old Front Page Logo (White box with Sparkles) */}
          <div style={{
            width: '32px',
            height: '32px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0c0d12',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
          }}>
            <Sparkles size={18} color="#0c0d12" />
          </div>

          {/* Brand name */}
          <div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              display: 'block',
              lineHeight: 1,
            }}>
              SkillBridge
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="mobile-menu-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'none',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Amber Accent Bar ─────────────────────────── */}
      <div className="amber-accent-bar" style={{ margin: '0', borderRadius: 0 }} />

      {/* ── Navigation ───────────────────────────────── */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: '4px' }}>
            <div className="sidebar-section-label">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <Icon size={16} className="sidebar-nav-icon" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Search Bar ───────────────────────────────── */}
      <div style={{
        padding: '10px 12px 8px',
        borderTop: '1px solid var(--border-card)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'text',
        }}>
          <Search size={13} color="var(--text-muted)" strokeWidth={2} />
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            flex: 1,
          }}>
            Search...
          </span>
          <kbd style={{
            fontSize: '0.6rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-card)',
            borderRadius: '4px',
            padding: '1px 5px',
          }}>
            /
          </kbd>
        </div>
      </div>

      {/* ── User Card ────────────────────────────────── */}
      <div style={{
        padding: '10px 12px 14px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {/* Avatar */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: '#08080a',
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'var(--font-display)',
            }}>
              {displayName}
            </p>
            <p style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '1px',
            }}>
              {targetRole}
            </p>
          </div>

          {/* Logout icon */}
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={onCloseMobile} />
      )}
      {sidebarContent}
    </>
  );
};

export default Sidebar;
