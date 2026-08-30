import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, ArrowRight, Zap, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-canvas)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
      }}>
        {/* ── Card ──────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.7), 0 24px 64px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Amber top accent bar */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 50%, transparent 100%)',
          }} />

          {/* ── Brand header ──────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                background: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#08080a',
                boxShadow: '0 2px 12px rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
              }}>
                <Sparkles size={20} color="#08080a" />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
              }}>
                SkillBridge
              </span>
            </Link>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginTop: '5px',
              letterSpacing: '0.01em',
            }}>
              Sign in to your AI career dashboard
            </p>
          </div>

          {/* ── Error ─────────────────────────────── */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: '0.82rem',
              marginBottom: '16px',
              border: '1px solid var(--danger-border)',
            }}>
              <AlertCircle size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ── Form ──────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Username"
              icon={UserIcon}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              icon={Lock}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              style={{ width: '100%', marginTop: '4px', borderRadius: 'var(--radius-md)' }}
            >
              Sign In
            </Button>
          </form>

          {/* ── Footer ────────────────────────────── */}
          <p style={{
            textAlign: 'center',
            marginTop: '22px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Create one
            </Link>
          </p>
        </div>

        {/* ── Bottom label ──────────────────────── */}
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          SkillBridge · Career AI Platform
        </p>
      </div>
    </div>
  );
};

export default Login;
