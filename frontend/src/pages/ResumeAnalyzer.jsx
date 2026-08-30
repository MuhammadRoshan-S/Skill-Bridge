import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Trash2,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import ProgressRing from '../components/charts/ProgressRing';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { resumeService } from '../services/resumeService';
import { useAuth } from '../context/AuthContext';

const ResumeAnalyzer = () => {
  const { refreshProfile } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [activating, setActivating] = useState(false);
  const fileInputRef = useRef(null);

  const fetchResumes = async (selectId = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await resumeService.listResumes();
      setResumes(data);
      let target = null;
      if (selectId) {
        target = data.find((r) => r.id === selectId);
      }
      if (!target) {
        target = data.find((r) => r.is_active) || data[0];
      }
      if (target) {
        setSelectedResume(target);
        setAnalysis(target.analysis || null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded = await resumeService.uploadResume(file);
      await fetchResumes(uploaded.id);
      // Auto trigger analysis on the newly uploaded resume
      handleAnalyze(uploaded.id);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.file?.[0] || 'Upload failed. File must be under 10MB.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleActivateResume = async (resumeId) => {
    const id = resumeId || selectedResume?.id;
    if (!id) return;

    setActivating(true);
    setError(null);
    try {
      const activated = await resumeService.activateResume(id);
      await fetchResumes(activated.id);
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to activate resume.');
    } finally {
      setActivating(false);
    }
  };

  const handleAnalyze = async (resumeId) => {
    const id = resumeId || selectedResume?.id;
    if (!id) return;

    setAnalyzing(true);
    setError(null);
    try {
      // Ensure it's activated
      try {
        await resumeService.activateResume(id);
      } catch (e) {
        // proceed to analyze
      }
      const res = await resumeService.analyzeResume(id);
      setAnalysis(res);
      await fetchResumes(id);
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumeService.deleteResume(resumeId);
      await fetchResumes();
    } catch (err) {
      console.error(err);
      alert('Failed to delete resume.');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Loading your resume telemetry..." />
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
              AI Resume Intelligence & ATS Audit
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Extract verified technical skills, evaluate keyword density, and receive actionable recruiter feedback.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx"
              style={{ display: 'none' }}
            />
            <Button
              variant="primary"
              icon={UploadCloud}
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Resume (PDF / DOCX)
            </Button>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={fetchResumes} />}

        {/* Upload Zone & Resumes List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Dropzone Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '36px 24px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px dashed #282b36',
              backgroundColor: '#12141a',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#282b36')}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--bg-pill)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <UploadCloud size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                Click to browse or drag & drop resume
              </p>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports standard PDF and Microsoft Word DOCX (up to 10MB)
              </p>
            </div>
          </div>

          {/* Resumes Library */}
          <Card title="Uploaded Resumes" subtitle={`${resumes.length} document(s) on file`} icon={FileText}>
            {resumes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
                No resumes uploaded yet. Upload one to start AI scoring!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {resumes.map((r) => {
                  const isSelected = selectedResume?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedResume(r);
                        setAnalysis(r.analysis || null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--bg-pill-active)' : '#111218',
                        border: isSelected
                          ? '1px solid rgba(255,255,255,0.25)'
                          : r.is_active
                          ? '1px solid var(--neon-green-border)'
                          : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <FileText size={16} color={r.is_active ? 'var(--neon-green)' : 'var(--text-secondary)'} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <p
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: '#fff',
                              }}
                            >
                              {r.original_filename}
                            </p>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(r.uploaded_at).toLocaleDateString()} • {r.file_type.toUpperCase()}
                            {r.analysis ? ` • Score: ${Math.round(r.analysis.overall_score)}%` : ' • Not analyzed'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {r.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateResume(r.id);
                            }}
                            disabled={activating}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              borderRadius: 'var(--radius-full)',
                              padding: '3px 10px',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--neon-green-bg)';
                              e.currentTarget.style.color = 'var(--neon-green)';
                              e.currentTarget.style.borderColor = 'var(--neon-green-border)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            }}
                            title="Activate this resume for platform analysis and recommendations"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(r.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          title="Delete resume"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Action Bar for Selected Resume */}
        {selectedResume && (
          <div
            className="glass-panel"
            style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selected Document:</span>
                {selectedResume.is_active && <Badge variant="success">Active Profile Document</Badge>}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {selectedResume.original_filename}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!selectedResume.is_active && (
                <Button
                  variant="secondary"
                  icon={CheckCircle}
                  loading={activating}
                  onClick={() => handleActivateResume(selectedResume.id)}
                >
                  Set as Active Resume
                </Button>
              )}
              <Button
                variant="primary"
                icon={Sparkles}
                loading={analyzing}
                onClick={() => handleAnalyze(selectedResume.id)}
              >
                {analysis ? 'Re-Analyze with AI' : 'Analyze with AI'}
              </Button>
            </div>
          </div>
        )}

        {/* AI Analysis Results Section */}
        {analysis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Score Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Overall Score */}
              <Card style={{ textAlign: 'center', padding: '28px' }}>
                <ProgressRing progress={analysis.overall_score} size={140} label="Overall Score" gradientId="analysisRing" />
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                  Weighted ATS compatibility & engineering recruiter evaluation
                </p>
              </Card>

              {/* Sub-Score Bars */}
              <Card title="Score Breakdown" subtitle="ATS evaluation vectors" icon={TrendingUp}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                  <ProgressBar value={analysis.content_score} variant="purple" striped showLabel label="Content Quality & Relevance" />
                  <ProgressBar value={analysis.format_score} variant="cyan" striped showLabel label="Format, ATS Readability & Structure" />
                  <ProgressBar value={analysis.impact_score} variant="green" striped showLabel label="Impact Verbs & Metric Quantification" />
                </div>
              </Card>
            </div>

            {/* Extracted Skills Chips */}
            <Card title="Extracted Technical & Domain Skills" subtitle="Automatically synced to your profile matrix" icon={Award}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.extracted_skills?.map((skill, idx) => (
                  <Badge key={idx} variant="primary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Strengths & Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {/* Strengths */}
              <Card title="Key Resume Strengths" subtitle="What makes this resume standout" icon={CheckCircle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.strengths?.map((str, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--neon-green-bg)',
                        border: '1px solid var(--neon-green-border)',
                      }}
                    >
                      <CheckCircle size={16} color="var(--neon-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.825rem', color: '#fff', lineHeight: 1.4 }}>
                        {str}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Improvements */}
              <Card title="Recommended Fixes & ATS Gaps" subtitle="Action items to boost interview callback rate" icon={AlertCircle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.improvements?.map((imp, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--warning-bg)',
                        border: '1px solid rgba(250, 204, 21, 0.25)',
                      }}
                    >
                      <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.825rem', color: '#fff', lineHeight: 1.4 }}>
                        {imp}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Collapsible Extracted Raw Text */}
            {analysis.raw_text && (
              <Card
                title="Parsed Document Content"
                subtitle="Raw text extracted by server-side parser"
                icon={FileText}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowRawText(!showRawText)}
                    icon={showRawText ? ChevronUp : ChevronDown}
                  >
                    {showRawText ? 'Hide Text' : 'View Text'}
                  </Button>
                }
              >
                {showRawText && (
                  <pre
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.775rem',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {analysis.raw_text}
                  </pre>
                )}
              </Card>
            )}
          </div>
        ) : selectedResume ? (
          <div className="glass-panel" style={{ padding: '44px', textAlign: 'center' }}>
            <Sparkles size={36} color="var(--text-primary)" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Resume Not Yet Analyzed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '6px auto 18px' }}>
              Run our AI engine to extract skills, evaluate formatting impact, and uncover ATS optimization points.
            </p>
            <Button
              variant="primary"
              icon={Sparkles}
              loading={analyzing}
              onClick={() => handleAnalyze(selectedResume.id)}
            >
              Start AI Analysis
            </Button>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
};

export default ResumeAnalyzer;
