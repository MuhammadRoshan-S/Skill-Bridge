import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Target,
  Compass,
  Briefcase,
  MessagesSquare,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Zap,
  Award,
  BarChart2,
  Star,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import StatCard from '../components/charts/StatCard';
import VelocityForecastChart from '../components/charts/VelocityForecastChart';
import PipelineStageChart from '../components/charts/PipelineStageChart';
import SpeedometerGauge from '../components/charts/SpeedometerGauge';
import GlobalDemandMap from '../components/charts/GlobalDemandMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

/* ─── Quick Action Cards data ──────────────────────────── */
const QUICK_ACTIONS = [
  {
    label:    'Resume Analyzer',
    desc:     'Get AI-powered ATS scoring and keyword recommendations for your resume.',
    icon:     FileText,
    path:     '/resume-analyzer',
    accent:   '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
  },
  {
    label:    'Skill Gap Analysis',
    desc:     'Compare your skills against target roles and find your gaps instantly.',
    icon:     Target,
    path:     '/skill-gap',
    accent:   '#60a5fa',
    accentBg: 'rgba(96,165,250,0.08)',
  },
  {
    label:    'Interview Prep',
    desc:     'Practice with AI-generated questions tailored to your target role.',
    icon:     MessagesSquare,
    path:     '/interview-prep',
    accent:   '#a78bfa',
    accentBg: 'rgba(167,139,250,0.08)',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const firstName = user?.user?.first_name || user?.user?.username || 'there';

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getDashboardData();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Aggregating your career intelligence..." />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorState message={error} onRetry={fetchDashboard} />
      </PageLayout>
    );
  }

  /* ── Derived metric values ─────────────────────────── */
  const careerReadiness  = data?.career_readiness  ?? 0;
  const skillMatchPct    = data?.skill_match?.percentage ?? 0;
  const resumeScore      = data?.resume_score      ?? 0;
  const interviewScore   = data?.avg_interview_score ?? 0;
  const learningProgress = data?.learning_progress ?? 0;

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">

        {/* ════════════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════════════ */}
        <div style={{
          padding: '32px 36px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background amber radial */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-60px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Magneto amber accent bar at top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 40%, transparent 100%)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              {/* Greeting label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
              }}>
                <Zap size={13} color="var(--primary)" strokeWidth={2.5} />
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--primary)',
                }}>
                  Career Dashboard
                </span>
              </div>

              {/* Big hero greeting — Magneto style */}
              <h1 className="hero-greeting">
                Hey, {firstName}.
                <br />
                <span className="accent-line">
                  {data?.target_role ? `Targeting ${data.target_role.title}.` : "Let's build your future."}
                </span>
              </h1>

              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                marginTop: '10px',
                maxWidth: '480px',
                lineHeight: 1.6,
              }}>
                {careerReadiness > 0
                  ? `You're ${careerReadiness}% career-ready. Keep pushing — your roadmap is active and your AI engine is tracking progress.`
                  : 'Start by uploading your resume or setting a target role to unlock your personalised AI career engine.'}
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                <Link to="/skill-gap" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" icon={Target}>
                    Analyze Skill Gap
                  </Button>
                </Link>
                <Link to="/roadmap" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" icon={Compass}>
                    View Roadmap
                  </Button>
                </Link>
              </div>
            </div>

            {/* Career readiness ring — simple circular progress */}
            {careerReadiness > 0 && (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="55" cy="55" r="44"
                    fill="none"
                    stroke="url(#amberArc)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44 * (careerReadiness / 100)} ${2 * Math.PI * 44}`}
                    transform="rotate(-90 55 55)"
                  />
                  <defs>
                    <linearGradient id="amberArc" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <text x="55" y="50" textAnchor="middle" fill="#f0f0ed" fontSize="20" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">
                    {careerReadiness}%
                  </text>
                  <text x="55" y="66" textAnchor="middle" fill="#555558" fontSize="9" fontWeight="500" fontFamily="'Inter', sans-serif" letterSpacing="0.08em">
                    READY
                  </text>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            4 STAT METRIC CARDS
        ════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}>
          <StatCard
            title="Career Readiness"
            value={careerReadiness > 0 ? `${careerReadiness}%` : '—'}
            trend={careerReadiness > 0 ? '+12%' : undefined}
            trendDirection="up"
            subtitle={data?.target_role ? `Target: ${data.target_role.title}` : 'Set a target role to begin'}
            icon={Award}
          />
          <StatCard
            title="Skill Match Score"
            value={skillMatchPct > 0 ? `${skillMatchPct}%` : '—'}
            trend={skillMatchPct > 0 ? `${data?.skills_count || 0} skills` : undefined}
            trendDirection="confidence"
            subtitle="Against target role requirements"
            icon={Target}
            accentColor={skillMatchPct >= 70 ? 'var(--neon-green)' : skillMatchPct >= 40 ? 'var(--primary)' : 'var(--coral-red)'}
          />
          <StatCard
            title="Resume ATS Score"
            value={resumeScore > 0 ? `${resumeScore}%` : '—'}
            trend={resumeScore > 0 ? (resumeScore >= 75 ? 'Strong' : 'Needs work') : undefined}
            trendDirection={resumeScore >= 75 ? 'up' : 'down'}
            subtitle={data?.resume?.original_filename || 'Upload resume to get scored'}
            icon={FileText}
          />
          <StatCard
            title="Interview Readiness"
            value={interviewScore > 0 ? `${interviewScore}%` : '—'}
            trend={interviewScore > 0 ? '91% conf.' : undefined}
            trendDirection="confidence"
            subtitle="AI callback prediction score"
            icon={MessagesSquare}
          />
        </div>

        {/* ════════════════════════════════════════════════
            MID ROW: Progress Chart + Global Job Demand Map
        ════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '14px',
          alignItems: 'stretch',
        }}>
          <VelocityForecastChart
            title="Skill Growth Velocity"
            viewFilter="Career Readiness"
            yAxisLabels={['100%', '80%', '60%', '40%', '20%', '0%']}
            dataPoints={[
              { month: 'Jan', val: 350, label: 'Jan/26', sub: 'Readiness: 35%' },
              { month: 'Feb', val: 460, label: 'Feb/26', sub: 'Readiness: 46%' },
              { month: 'Mar', val: 550, label: 'Mar/26', sub: 'Readiness: 55%' },
              { month: 'Apr', val: 630, label: 'Apr/26', sub: `Readiness: ${careerReadiness || 63}%` },
              { month: 'May', val: 700, label: 'May/26', sub: 'Target: 70%' },
              { month: 'Jun', val: 800, label: 'Jun/26', sub: 'Target: 80%' },
              { month: 'Jul', val: 900, label: 'Jul/26', sub: 'Target: 90%' },
            ]}
            activeMonthIndex={3}
          />

          <GlobalDemandMap
            title="Global Job Demand"
            dropdownLabel="Top Markets"
            hubs={[
              { country: 'USA',     flag: '🇺🇸', jobs: '7.2K', x: 23, y: 44 },
              { country: 'Canada',  flag: '🇨🇦', jobs: '2.8K', x: 20, y: 32 },
              { country: 'UK',      flag: '🇬🇧', jobs: '4.1K', x: 47, y: 38 },
              { country: 'Germany', flag: '🇩🇪', jobs: '3.6K', x: 54, y: 36 },
              { country: 'India',   flag: '🇮🇳', jobs: '18K',  x: 70, y: 52 },
              { country: 'UAE',     flag: '🇦🇪', jobs: '2.1K', x: 63, y: 48 },
              { country: 'Japan',   flag: '🇯🇵', jobs: '3.3K', x: 84, y: 43 },
            ]}
          />
        </div>

        {/* ════════════════════════════════════════════════
            BOTTOM ROW: Learning Pipeline + Readiness Gauge
        ════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '14px',
          alignItems: 'stretch',
        }}>
          <PipelineStageChart
            title="Learning Pipeline"
            stages={[
              {
                id: 'foundations',
                label: 'Foundations',
                value: 'Core Skills',
                color: '#f59e0b',
                stripeClass: 'stripe-fill-amber',
                barHeight: 56,
                sublabel: 'HTML, CSS, Git',
              },
              {
                id: 'core-stack',
                label: 'Core Stack',
                value: 'In Progress',
                color: '#60a5fa',
                stripeClass: 'stripe-fill-blue',
                barHeight: 44,
                sublabel: 'React, Node.js',
              },
              {
                id: 'advanced',
                label: 'Advanced AI',
                value: 'Upcoming',
                color: '#a78bfa',
                stripeClass: 'stripe-fill-purple',
                barHeight: 30,
                sublabel: 'ML, APIs, Cloud',
              },
              {
                id: 'job-ready',
                label: 'Job Ready',
                value: 'Target',
                color: '#4ade80',
                stripeClass: 'stripe-fill-green',
                barHeight: 18,
                sublabel: 'Portfolio + Offers',
              },
            ]}
          />

          <SpeedometerGauge
            title="Career Readiness Score"
            value={careerReadiness || 65}
            target={80}
            targetText={careerReadiness > 0
              ? `${careerReadiness >= 80 ? '🎯 Target achieved!' : `On track for 80% goal`}`
              : 'Set a target role to calibrate'}
          />
        </div>

        {/* ════════════════════════════════════════════════
            MIDDLE: Skill Gap Card + Learning Roadmap Card + Jobs Card
        ════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '14px',
        }}>

          {/* ── Skill Gap & Role Benchmark ─────────────── */}
          <Card
            title={data?.target_role ? `Target: ${data.target_role.title}` : 'Skill Gap Analysis'}
            subtitle="AI matching against live market demand"
            icon={Target}
            action={
              <Link to="/skill-gap" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  Deep Analysis
                </Button>
              </Link>
            }
          >
            {data?.skill_match ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <ProgressBar
                  value={data.skill_match.percentage}
                  variant="purple"
                  striped
                  showLabel
                  label="Role Match"
                  height="8px"
                />

                {/* Matched Strengths */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.745rem',
                    fontWeight: 600,
                    color: 'var(--neon-green)',
                    marginBottom: '7px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    <CheckCircle size={12} />
                    <span>Verified Strengths ({data.skill_match.matched?.length || 0})</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {data.skill_match.matched?.slice(0, 8).map((skill, idx) => (
                      <Badge key={idx} variant="success">
                        {typeof skill === 'object' ? skill.name : skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.745rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    marginBottom: '7px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    <AlertTriangle size={12} />
                    <span>Priority Gaps ({data.missing_skills?.length || 0})</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {data.missing_skills?.slice(0, 8).map((skill, idx) => (
                      <Badge key={idx} variant="warning">
                        {typeof skill === 'object' ? skill.name : skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Target size={32} color="var(--text-muted)" strokeWidth={1} style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.845rem', lineHeight: 1.5 }}>
                  Set a target role to benchmark your skills and unlock AI-generated gap analysis.
                </p>
                <Link to="/skill-gap" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" icon={Target}>Configure Target Role</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* ── Learning Roadmap ───────────────────────── */}
          <Card
            title="Learning Roadmap"
            subtitle="AI-personalised milestone progress"
            icon={Compass}
            action={
              <Link to="/roadmap" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  Open Roadmap
                </Button>
              </Link>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ProgressBar
                value={learningProgress}
                variant="cyan"
                striped
                showLabel
                label="Milestones Completed"
                height="8px"
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
              }}>
                {[
                  { label: 'Completed', value: data?.resources_completed || 0,    color: 'var(--neon-green)' },
                  { label: 'In Progress', value: data?.resources_in_progress || 0, color: 'var(--primary)' },
                  { label: 'Remaining', value: Math.max(0, (data?.total_resources || 0) - (data?.resources_completed || 0) - (data?.resources_in_progress || 0)), color: 'var(--text-muted)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid var(--border-card)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color, letterSpacing: '-0.03em' }}>
                      {value}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ready for the next module?
                </span>
                <Link to="/roadmap" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm" icon={BookOpen}>
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* ── Recommended Jobs ───────────────────────── */}
          <Card
            title="Recommended Jobs"
            subtitle="Ranked by your verified skill profile"
            icon={Briefcase}
            action={
              <Link to="/jobs" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  View All
                </Button>
              </Link>
            }
          >
            {data?.recommended_jobs && data.recommended_jobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.recommended_jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid var(--border-card)',
                      transition: 'border-color 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.845rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                        {job.title}
                      </h4>
                      <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {job.company}
                      </p>
                    </div>
                    <span className="badge badge-success">{job.match_score}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Briefcase size={32} color="var(--text-muted)" strokeWidth={1} style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.845rem', lineHeight: 1.5 }}>
                  Discover jobs matched precisely to your skills and target salary range.
                </p>
                <Link to="/jobs" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" icon={Briefcase}>Discover Job Matches</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* ════════════════════════════════════════════════
            QUICK ACTIONS ROW
        ════════════════════════════════════════════════ */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
          }}>
            <Zap size={13} color="var(--primary)" strokeWidth={2.5} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--primary)',
            }}>
              Quick Actions
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {QUICK_ACTIONS.map(({ label, desc, icon: Icon, path, accent, accentBg }) => (
              <Link key={path} to={path} className="quick-action-card" style={{ textDecoration: 'none' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: accentBg,
                  border: `1px solid ${accent}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  <Icon size={18} color={accent} strokeWidth={1.75} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.93rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: '6px',
                }}>
                  {label}
                </h3>
                <p style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}>
                  {desc}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '14px',
                  color: accent,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}>
                  <span>Launch</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  );
};

export default Dashboard;
