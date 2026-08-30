import React, { useState, useEffect } from 'react';
import {
  MessagesSquare,
  Sparkles,
  Award,
  CheckCircle,
  AlertCircle,
  Send,
  RotateCcw,
  Clock,
  ChevronRight,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { interviewService } from '../services/interviewService';
import { skillService } from '../services/skillService';
import { useAuth } from '../context/AuthContext';

const InterviewPrep = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // New Session Setup form
  const [sessionType, setSessionType] = useState('technical');
  const [numQuestions, setNumQuestions] = useState(5);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsData, rolesData] = await Promise.all([
        interviewService.listSessions(),
        skillService.getJobRoles(),
      ]);
      setSessions(sessionsData);
      setRoles(rolesData);
      setSelectedRoleId(user?.target_role || rolesData[0]?.id || '');

      const inProgress = sessionsData.find((s) => s.status === 'in_progress');
      if (inProgress) {
        loadSessionDetail(inProgress.id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load interview sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const loadSessionDetail = async (sessionId) => {
    try {
      const detail = await interviewService.getSessionDetail(sessionId);
      setCurrentSession(detail);
      const firstUnanswered = detail.questions.findIndex((q) => !q.is_answered);
      setCurrentQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
      setUserAnswer('');
      setShowHints(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load session details.');
    }
  };

  const handleCreateSession = async () => {
    setCreating(true);
    setError(null);
    try {
      const session = await interviewService.createSession(
        selectedRoleId || undefined,
        sessionType,
        numQuestions
      );
      setCurrentSession(session);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setShowHints(false);
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      setError('Failed to generate interview session.');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || userAnswer.trim().length < 10) {
      alert('Please provide an answer of at least 10 characters.');
      return;
    }

    const currentQuestion = currentSession?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setSubmitting(true);
    try {
      await interviewService.submitAnswer(currentQuestion.id, userAnswer);
      const updated = await interviewService.getSessionDetail(currentSession.id);
      setCurrentSession(updated);

      if (updated.status === 'completed') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate answer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Calibrating AI interviewer persona..." />
      </PageLayout>
    );
  }

  const currentQuestion = currentSession?.questions?.[currentQuestionIndex];
  const isAnswered = currentQuestion?.is_answered;
  const answerData = currentQuestion?.answer;

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              AI Mock Interview Simulator
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Practice technical and behavioral questions with instant AI scoring, hint generation, and STAR-method feedback.
            </p>
          </div>

          {currentSession && (
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={() => setCurrentSession(null)}
            >
              Start New Session
            </Button>
          )}
        </div>

        {error && <ErrorState message={error} onRetry={fetchInitialData} />}

        {/* Live Session Workspace vs Setup Screen */}
        {currentSession ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Session Top Bar: Progress & Question Selectors */}
            <Card style={{ padding: '18px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      {currentSession.session_type?.toUpperCase()} Interview Session
                    </h2>
                    <Badge variant="primary">{currentSession.target_role_title || 'General'}</Badge>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Question {currentQuestionIndex + 1} of {currentSession.total_questions}
                  </p>
                </div>

                {currentSession.average_score > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Score:</span>
                    <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '5px 10px' }}>
                      {Math.round(currentSession.average_score)}/100
                    </span>
                  </div>
                )}
              </div>

              {/* Question Navigation Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {currentSession.questions?.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setUserAnswer('');
                      setShowHints(false);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: currentQuestionIndex === idx ? 'rgba(255,255,255,0.25)' : 'var(--border-subtle)',
                      backgroundColor:
                        currentQuestionIndex === idx
                          ? 'var(--bg-pill-active)'
                          : q.is_answered
                          ? 'var(--neon-green-bg)'
                          : '#111218',
                      color: q.is_answered ? 'var(--neon-green)' : '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>Q{idx + 1}</span>
                    {q.is_answered && <CheckCircle size={13} />}
                  </button>
                ))}
              </div>
            </Card>

            {/* Current Question & Answer Area */}
            {currentQuestion && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {/* Left Card: The Question */}
                <Card
                  title={`Question #${currentQuestion.order}`}
                  subtitle={`Topic: ${currentQuestion.topic || 'General'}`}
                  icon={MessagesSquare}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Badge variant={currentQuestion.difficulty === 'easy' ? 'success' : currentQuestion.difficulty === 'hard' ? 'danger' : 'warning'}>
                      {currentQuestion.difficulty?.toUpperCase()}
                    </Badge>
                    <Badge variant="primary">{currentQuestion.question_type}</Badge>
                  </div>

                  <p
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.55,
                      marginBottom: '16px',
                    }}
                  >
                    {currentQuestion.question_text}
                  </p>

                  {/* AI Hints Accordion */}
                  {currentQuestion.hints?.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <button
                        onClick={() => setShowHints(!showHints)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: 0,
                        }}
                      >
                        <Sparkles size={15} color="var(--neon-green)" />
                        {showHints ? 'Hide AI Guidance Hints' : 'Reveal AI Guidance Hints'}
                      </button>

                      {showHints && (
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#111218',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <ul style={{ paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {currentQuestion.hints.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                {/* Right Card: Answer Area or AI Evaluation Results */}
                <Card
                  title={isAnswered ? 'AI Evaluation & Score' : 'Your Answer'}
                  subtitle={isAnswered ? 'Constructive recruiter & technical feedback' : 'Draft your response clearly'}
                  icon={Award}
                >
                  {isAnswered ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Score Banner */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor:
                            answerData.score >= 75
                              ? 'var(--neon-green-bg)'
                              : answerData.score >= 50
                              ? 'var(--warning-bg)'
                              : 'var(--danger-bg)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score Awarded</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{answerData.score}/100</div>
                        </div>
                        <Badge variant={answerData.score >= 70 ? 'success' : 'warning'}>
                          {answerData.score >= 75 ? 'Strong Answer' : answerData.score >= 50 ? 'Passable' : 'Needs Improvement'}
                        </Badge>
                      </div>

                      {/* AI Feedback Paragraph */}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          AI Feedback:
                        </span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                          {answerData.ai_feedback}
                        </p>
                      </div>

                      {/* Strengths */}
                      {answerData.strengths?.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--neon-green)', marginBottom: '4px' }}>
                            <CheckCircle size={14} />
                            <span>Strengths Noted:</span>
                          </div>
                          <ul style={{ paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                            {answerData.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {answerData.improvements?.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '4px' }}>
                            <AlertCircle size={14} />
                            <span>Areas to Polish:</span>
                          </div>
                          <ul style={{ paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                            {answerData.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Next Question Shortcut */}
                      {currentQuestionIndex < currentSession.total_questions - 1 && (
                        <Button
                          variant="primary"
                          icon={ChevronRight}
                          onClick={() => {
                            setCurrentQuestionIndex(currentQuestionIndex + 1);
                            setUserAnswer('');
                          }}
                          style={{ marginTop: '8px' }}
                        >
                          Next Question
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <textarea
                        className="input-field"
                        rows={7}
                        placeholder="Type your response here with detailed technical terminology and STAR methodology..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {userAnswer.length} characters (minimum 10)
                        </span>

                        <Button
                          variant="primary"
                          icon={Send}
                          loading={submitting}
                          disabled={userAnswer.trim().length < 10}
                          onClick={handleSubmitAnswer}
                        >
                          Submit for AI Review
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        ) : (
          /* Session Creator Screen */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Setup Form */}
            <Card title="Launch Mock Interview Session" subtitle="Configure interview format and focus area" icon={Sparkles}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Target Job Role
                  </label>
                  <select
                    className="input-field"
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Interview Focus Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { label: '💻 Technical Coding & API', value: 'technical' },
                      { label: '🤝 Behavioral & STAR', value: 'behavioral' },
                      { label: '🏛️ System Design', value: 'system_design' },
                      { label: '🎯 Mixed Evaluation', value: 'mixed' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setSessionType(type.value)}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: sessionType === type.value ? 'rgba(255,255,255,0.25)' : 'var(--border-subtle)',
                          backgroundColor: sessionType === type.value ? 'var(--bg-pill-active)' : '#111218',
                          color: sessionType === type.value ? '#fff' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Question Count: {numQuestions}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--text-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    <span>3 (Quick)</span>
                    <span>5 (Standard)</span>
                    <span>8 (Deep Dive)</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  icon={Sparkles}
                  loading={creating}
                  onClick={handleCreateSession}
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  Generate AI Interview Questions
                </Button>
              </div>
            </Card>

            {/* Past Interview Sessions History */}
            <Card title="Past Interview History" subtitle={`${sessions.length} recorded session(s)`} icon={History}>
              {sessions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px' }}>
                  No interview sessions completed yet. Launch one today to practice!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => loadSessionDetail(s.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#111218',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-pill-active)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111218')}
                    >
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.session_type?.toUpperCase()} — {s.target_role_title || 'General'}
                        </h4>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {new Date(s.created_at).toLocaleDateString()} • {s.completed_questions}/{s.total_questions} answered
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {s.average_score > 0 && (
                          <Badge variant={s.average_score >= 70 ? 'success' : 'warning'}>
                            {Math.round(s.average_score)}%
                          </Badge>
                        )}
                        <Badge variant={s.status === 'completed' ? 'success' : 'primary'}>
                          {s.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default InterviewPrep;
