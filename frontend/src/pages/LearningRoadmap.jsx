import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { roadmapService } from '../services/roadmapService';
import { useAuth } from '../context/AuthContext';

const LearningRoadmap = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const fetchRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roadmapService.getActiveRoadmap();
      setRoadmap(data);
      const exp = {};
      data?.milestones?.forEach((m) => {
        exp[m.id] = true;
      });
      setExpandedMilestones(exp);
    } catch (err) {
      if (err.response?.status === 404) {
        setRoadmap(null);
      } else {
        console.error(err);
        setError('Failed to load learning roadmap.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleMilestone = async (milestoneId) => {
    try {
      const updated = await roadmapService.toggleMilestone(milestoneId);
      if (updated.is_completed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      await fetchRoadmap();
    } catch (err) {
      console.error(err);
      alert('Failed to update milestone status.');
    }
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    setError(null);
    try {
      const targetRoleId = user?.target_role || 1;
      const data = await roadmapService.generateRoadmap(targetRoleId);
      setRoadmap(data);
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch (err) {
      console.error(err);
      setError('Roadmap generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Generating your adaptive learning path..." />
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
              Personalized Learning Roadmap
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              AI-sequenced milestones and curated open resources to bridge your verified skill gaps.
            </p>
          </div>

          <Button
            variant="primary"
            icon={Sparkles}
            loading={generating}
            onClick={handleGenerateNew}
          >
            {roadmap ? 'Regenerate with AI' : 'Generate Roadmap'}
          </Button>
        </div>

        {error && <ErrorState message={error} onRetry={fetchRoadmap} />}

        {roadmap ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Roadmap Overview Banner */}
            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{roadmap.title}</h2>
                    <Badge variant="primary">{roadmap.target_role_title}</Badge>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '750px', lineHeight: 1.5 }}>
                    {roadmap.description}
                  </p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '160px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Duration:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--electric-blue)' }}>
                    ~{roadmap.estimated_weeks} Weeks
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <ProgressBar
                  value={roadmap.progress_percentage || 0}
                  variant="cyan"
                  striped
                  showLabel
                  label="Roadmap Completion"
                  height="10px"
                />
              </div>
            </Card>

            {/* Milestones Vertical Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {roadmap.milestones?.map((milestone, index) => {
                const isExpanded = expandedMilestones[milestone.id];
                const isCompleted = milestone.is_completed;

                return (
                  <div
                    key={milestone.id}
                    className="glass-panel"
                    style={{
                      padding: '20px 24px',
                      borderLeft: isCompleted
                        ? '3.5px solid var(--neon-green)'
                        : '3.5px solid #a855f7',
                      backgroundColor: isCompleted
                        ? 'rgba(74, 222, 128, 0.03)'
                        : 'var(--bg-card)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Milestone Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleExpand(milestone.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMilestone(milestone.id);
                          }}
                          style={{
                            background: isCompleted ? 'var(--neon-green)' : 'transparent',
                            border: isCompleted
                              ? 'none'
                              : '1.5px solid var(--border-medium)',
                            color: '#0c0d12',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isCompleted && <CheckCircle2 size={16} />}
                        </button>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                              PHASE {index + 1}
                            </span>
                            {isCompleted && <Badge variant="success">Completed</Badge>}
                          </div>
                          <h3
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.75 : 1,
                            }}
                          >
                            {milestone.title}
                          </h3>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Clock size={14} />
                          <span>~{milestone.estimated_hours} hrs</span>
                        </div>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Milestone Details & Resources */}
                    {isExpanded && (
                      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                          {milestone.description}
                        </p>

                        {/* Resources Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Recommended Learning Materials ({milestone.resources?.length || 0})
                          </span>

                          {milestone.resources?.map((res) => (
                            <div
                              key={res.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#111218',
                                border: '1px solid var(--border-subtle)',
                                flexWrap: 'wrap',
                                gap: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-pill)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <BookOpen size={16} />
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {res.title}
                                  </h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                    <span>{res.provider || 'Self-Paced'}</span>
                                    <span>•</span>
                                    <span>~{res.estimated_hours} hrs</span>
                                    {res.rating > 0 && (
                                      <>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#facc15' }}>
                                          <Star size={11} fill="#facc15" /> {res.rating}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {res.is_free && <Badge variant="success">Free</Badge>}
                                <Badge variant="primary">{res.difficulty}</Badge>

                                {res.url && (
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '5px 10px',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: 'var(--bg-pill)',
                                      border: '1px solid var(--border-subtle)',
                                      color: '#fff',
                                      fontSize: '0.775rem',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <span>Open</span>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Compass}
            title="No Active Learning Roadmap"
            description="Generate a personalized, milestone-driven curriculum crafted specifically for your target role and skill gaps."
            actionLabel="Generate AI Roadmap"
            actionIcon={Sparkles}
            onAction={handleGenerateNew}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default LearningRoadmap;
