import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Compass,
  ArrowRight,
  Edit3,
  List,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import ProgressRing from '../components/charts/ProgressRing';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { skillService } from '../services/skillService';
import { roadmapService } from '../services/roadmapService';
import { useAuth } from '../context/AuthContext';

const SkillGap = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [roleMode, setRoleMode] = useState('preset'); // 'preset' | 'custom'
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [error, setError] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const rolesData = await skillService.getJobRoles();
      setRoles(rolesData);

      const currentTargetId = user?.target_role || rolesData[0]?.id;
      if (currentTargetId) {
        setSelectedRoleId(currentTargetId);
      }

      try {
        const latest = await skillService.getLatestGapAnalysis();
        setAnalysis(latest);
        if (latest.target_role) {
          setSelectedRoleId(latest.target_role);
        }
      } catch (e) {
        // No analysis yet
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleRunAnalysis = async () => {
    let payload = null;
    if (roleMode === 'custom') {
      const trimmed = customRoleInput.trim();
      if (!trimmed) {
        setError('Please enter a custom target role title.');
        return;
      }
      if (trimmed.length < 3) {
        setError('Target role title is too short. Please enter a valid job title.');
        return;
      }
      // Quick client check for obvious keyboard smash (e.g., semicolon or no vowels in long words)
      if (/[;<>{}|\\`~^=$%*!@]/.test(trimmed)) {
        setError('Please enter a valid job title without special punctuation or symbols.');
        return;
      }
      payload = { custom_role: trimmed, force_refresh: true };
    } else {
      if (!selectedRoleId) return;
      payload = { target_role_id: selectedRoleId, force_refresh: true };
    }

    setAnalyzing(true);
    setError(null);
    try {
      const result = await skillService.runGapAnalysis(payload);
      setAnalysis(result);
      await refreshProfile();
    } catch (err) {
      console.error(err);
      const apiErrorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'AI Skill Gap Analysis failed.';
      setError(apiErrorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    let payload = null;
    if (roleMode === 'custom' && customRoleInput.trim()) {
      payload = { custom_role: customRoleInput.trim() };
    } else if (selectedRoleId) {
      payload = { target_role_id: selectedRoleId };
    } else if (analysis?.target_role) {
      payload = { target_role_id: analysis.target_role };
    }
    if (!payload) return;

    setGeneratingRoadmap(true);
    try {
      await roadmapService.generateRoadmap(payload);
      navigate('/roadmap');
    } catch (err) {
      console.error(err);
      alert('Failed to generate roadmap.');
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Loading skill benchmark models..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Skill Gap & Role Benchmark
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Benchmark verified capabilities against preset industry standards or your custom typed career role.
            </p>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={fetchInitialData} />}

        {/* Role Selector Card */}
        <Card title="Target Role Selection" subtitle="Choose a preset catalog role or type your exact custom career goal" icon={Target}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setRoleMode('preset')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: roleMode === 'preset' ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid var(--border-subtle)',
                  backgroundColor: roleMode === 'preset' ? 'var(--bg-pill-active)' : '#111218',
                  color: roleMode === 'preset' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <List size={14} />
                <span>Preset Catalog Roles</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleMode('custom')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: roleMode === 'custom' ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid var(--border-subtle)',
                  backgroundColor: roleMode === 'custom' ? 'var(--bg-pill-active)' : '#111218',
                  color: roleMode === 'custom' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Edit3 size={14} />
                <span>Custom Target Role (Type Any)</span>
              </button>
            </div>

            {/* Input / Dropdown row */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                {roleMode === 'preset' ? (
                  <select
                    className="input-field"
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title} ({role.industry || 'Tech'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type custom role, e.g. Lead MLOps Architect, Next.js Full Stack Specialist..."
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRunAnalysis();
                      }}
                      style={{ paddingRight: '12px' }}
                    />
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                icon={Sparkles}
                loading={analyzing}
                onClick={handleRunAnalysis}
              >
                Run AI Gap Analysis
              </Button>

              {analysis && (
                <Button
                  variant="secondary"
                  icon={Compass}
                  loading={generatingRoadmap}
                  onClick={handleGenerateRoadmap}
                >
                  Generate Custom Roadmap
                </Button>
              )}
            </div>

            {roleMode === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '-4px' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Quick Suggestions:</span>
                {[
                  'Staff AI Application Engineer',
                  'Cloud Security & DevSecOps Lead',
                  'Senior Backend Go/Python Engineer',
                  'AI Systems & RAG Specialist',
                  'Full Stack Next.js Architect',
                ].map((suggestion) => (
                  <span
                    key={suggestion}
                    onClick={() => setCustomRoleInput(suggestion)}
                    style={{
                      fontSize: '0.725rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    + {suggestion}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Analysis Results Display */}
        {analysis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Match Meter & Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Match Ring */}
              <Card style={{ textAlign: 'center', padding: '28px' }}>
                <ProgressRing
                  progress={analysis.match_percentage}
                  size={140}
                  label="Match Fit"
                  gradientId="gapRing"
                />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '14px', color: '#fff' }}>
                  {analysis.target_role_title}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {analysis.match_percentage >= 75
                    ? '🎯 Strong Match! You are close to meeting senior job criteria.'
                    : analysis.match_percentage >= 50
                    ? '⚡ Moderate Match. Bridging priority gaps will unlock top opportunities.'
                    : '🌱 Foundational Stage. Follow the customized learning roadmap below.'}
                </p>
              </Card>

              {/* Recommendations Card */}
              <Card title="Strategic AI Advice" subtitle="Tailored learning directives" icon={Compass}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#111218',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <Sparkles size={16} color="var(--neon-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.825rem', color: '#fff', lineHeight: 1.4 }}>
                        {rec}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Matched vs Missing Comparison Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {/* Matched Skills */}
              <Card
                title={`Matched Skills (${analysis.matched_skills?.length || 0})`}
                subtitle="Skills you possess that satisfy role requirements"
                icon={CheckCircle}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.matched_skills?.length > 0 ? (
                    analysis.matched_skills.map((skill, idx) => {
                      const name = typeof skill === 'object' ? skill.name : skill;
                      const prof = typeof skill === 'object' ? skill.proficiency : 'Intermediate';
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--neon-green-bg)',
                            border: '1px solid var(--neon-green-border)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={15} color="var(--neon-green)" />
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{name}</span>
                          </div>
                          <Badge variant="success">{prof}</Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                      No direct skill matches detected yet.
                    </p>
                  )}
                </div>
              </Card>

              {/* Missing Skills */}
              <Card
                title={`Missing Competencies (${analysis.missing_skills?.length || 0})`}
                subtitle="Skills recommended to unlock this job title"
                icon={AlertTriangle}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.missing_skills?.length > 0 ? (
                    analysis.missing_skills.map((skill, idx) => {
                      const name = typeof skill === 'object' ? skill.name : skill;
                      const imp = typeof skill === 'object' ? skill.importance : 'Critical';
                      const weeks = typeof skill === 'object' && skill.estimated_weeks ? `${skill.estimated_weeks}w` : null;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--warning-bg)',
                            border: '1px solid rgba(250, 204, 21, 0.25)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={15} color="var(--warning)" />
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{name}</span>
                              {weeks && (
                                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                  ~{weeks} prep
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="warning">{imp}</Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                      Congratulations! No missing competencies for this target role.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Target size={40} color="var(--text-primary)" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ready to Measure Your Fit?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '440px', margin: '6px auto 20px' }}>
              Select a target role above and click <strong>"Run AI Gap Analysis"</strong> to generate a comparison matrix with matched strengths and learning roadmap recommendations.
            </p>
            <Button variant="primary" icon={Sparkles} onClick={handleRunAnalysis} loading={analyzing}>
              Run AI Gap Analysis
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SkillGap;
