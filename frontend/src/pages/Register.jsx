import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, Mail, ArrowRight, Zap, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username:         '',
    email:            '',
    first_name:       '',
    last_name:        '',
    password:         '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const res = err.response?.data;
      if (typeof res === 'object' && res !== null) {
        const firstKey = Object.keys(res)[0];
        const msg = Array.isArray(res[firstKey]) ? res[firstKey][0] : res[firstKey];
        setError(`${firstKey}: ${msg}`);
      } else {
        setError('Registration failed. Please check your information.');
      }
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
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '480px',
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
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
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
              Create your account
            </h1>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginTop: '5px',
              letterSpacing: '0.01em',
            }}>
              Start your AI-powered career growth journey
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>

            {/* First + Last Name row */}
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <Input
                label="First Name"
                name="first_name"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
              <Input
                label="Last Name"
                name="last_name"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </div>

            <Input
              label="Username"
              name="username"
              icon={UserIcon}
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Enter password (min. 8 characters)"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <Input
              label="Confirm Password"
              name="password_confirm"
              type="password"
              icon={Lock}
              placeholder="Confirm password"
              value={formData.password_confirm}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              style={{ width: '100%', marginTop: '6px', borderRadius: 'var(--radius-md)' }}
            >
              Create Free Account
            </Button>
          </form>

          {/* ── Footer ────────────────────────────── */}
          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Sign In
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

export default Register;
