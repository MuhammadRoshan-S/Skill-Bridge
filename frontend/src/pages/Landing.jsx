import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Target,
  Compass,
  MessagesSquare,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Award,
  LogIn,
  Layers,
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'AI Resume Scoring & ATS Audit',
      description: 'Upload your PDF/DOCX resume to instantly evaluate content depth, impact verbs, and technical keyword density.',
      badge: 'Instant Audit',
    },
    {
      icon: Target,
      title: 'Real-Time Skill Gap Matrix',
      description: 'Benchmark your profile against target roles (Full Stack, AI/ML, Cloud) to identify critical and high-value missing competencies.',
      badge: 'Role Benchmark',
    },
    {
      icon: Compass,
      title: 'Dynamic Learning Roadmaps',
      description: 'Get an AI-curated milestone curriculum with free and top-rated tutorials, projects, and courses tailored to your specific gaps.',
      badge: 'Custom Curriculum',
    },
    {
      icon: MessagesSquare,
      title: 'Interactive AI Mock Interviews',
      description: 'Practice role-specific technical and behavioral questions with instant AI scoring, hint generation, and constructive feedback.',
      badge: 'Simulated Prep',
    },
    {
      icon: Layers,
      title: 'Deep Competency Taxonomy',
      description: 'Categorize verified and emerging skills across frontend, backend, AI, devops, and cloud infrastructure with proficiency tracking.',
      badge: 'Skill Taxonomy',
    },
    {
      icon: TrendingUp,
      title: 'Career Readiness Telemetry',
      description: 'Track your growth over time with continuous readiness scoring, interview performance analytics, and roadmap completion.',
      badge: 'Predictive Index',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Top Navigation */}
      <header
        style={{
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          maxWidth: '1400px',
          margin: '0 auto',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
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
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0c0d12',
              boxShadow: '0 2px 10px rgba(255, 255, 255, 0.2)',
            }}
          >
            <Sparkles size={18} color="#0c0d12" />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            SkillBridge
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={ArrowRight}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" icon={LogIn}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="primary">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '70px 24px 50px',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-pill)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--neon-green)',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '24px',
          }}
          className="animate-fade-in"
        >
          <Sparkles size={14} />
          Powered by Next-Gen LLM Career Intelligence
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
          }}
        >
          Bridge the Gap Between Your Skills and Your <span className="glow-gradient">Dream Job</span>
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Analyze your resume with AI, uncover hidden skill gaps for target roles, follow personalized learning roadmaps, and ace mock interviews with real-time feedback.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard');
              } else {
                navigate('/login');
              }
            }}
          >
            Start Analysis
          </Button>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '28px',
            marginTop: '44px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--neon-green)" />
            <span>Secure Role-Based Access</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="var(--neon-green)" />
            <span>Instant PDF & DOCX Parsing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} color="var(--electric-blue)" />
            <span>Encrypted Token Authentication</span>
          </div>
        </div>
      </section>

      {/* Grid of Features */}
      <section
        style={{
          padding: '40px 24px 80px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--neon-green)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Engine Features
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', letterSpacing: '-0.02em' }}>
            A Complete AI Career Operating System
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'var(--bg-pill)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="badge badge-primary">{f.badge}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Bar */}
      <section
        style={{
          padding: '60px 24px',
          maxWidth: '1100px',
          margin: '0 auto 60px',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '50px 36px',
            textAlign: 'center',
            backgroundColor: '#12141a',
            border: '1px solid var(--border-medium)',
          }}
        >
          <Award size={44} color="#fff" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Ready to Accelerate Your Career Trajectory?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 28px' }}>
            Join developers leveling up their resumes, mastering missing skills, and preparing for high-impact technical interviews.
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard');
              } else {
                navigate('/login');
              }
            }}
          >
            Start Analysis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '28px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.825rem',
        }}
      >
        <p>© 2026 SkillBridge AI Platform. Full-Stack Career & Skill-Gap Analysis Suite.</p>
      </footer>
    </div>
  );
};

export default Landing;
