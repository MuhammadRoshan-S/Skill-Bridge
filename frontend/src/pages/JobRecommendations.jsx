import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Sparkles,
  MapPin,
  DollarSign,
  ExternalLink,
  Building,
  Clock,
  Search,
  Target,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Filter,
  Sliders,
  ChevronRight,
  RotateCw,
  Folder,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';

const getLinkedInUrl = (title, company) => {
  const query = encodeURIComponent(`${title} ${company}`.trim());
  return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
};

const getIndeedUrl = (title, company, location = '') => {
  const q = encodeURIComponent(`${title} ${company}`.trim());
  const l = encodeURIComponent(location || '');
  return `https://www.indeed.com/jobs?q=${q}&l=${l}`;
};

const getGoogleJobsUrl = (title, company) => {
  const q = encodeURIComponent(`${title} ${company} jobs`.trim());
  return `https://www.google.com/search?q=${q}&ibp=htl;jobs`;
};

const JobRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [roleInput, setRoleInput] = useState('Full Stack Developer');
  const [locationInput, setLocationInput] = useState('Kochi, Kerala, India');
  const [radius, setRadius] = useState('25 km');
  const [jobType, setJobType] = useState('all');
  const [expLevel, setExpLevel] = useState('All Levels');
  const [workMode, setWorkMode] = useState('All');
  const [salaryFilter, setSalaryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Best Match');

  // Sidebar Refine Filters State
  const [sidebarExp, setSidebarExp] = useState(['1-3', '3-5']);
  const [sidebarModes, setSidebarModes] = useState(['On-site', 'Hybrid', 'Remote']);
  const [sidebarSalaries, setSidebarSalaries] = useState(['6-12']);

  // Modal State
  const [previewJobRec, setPreviewJobRec] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  const fetchJobs = async (customPayload = null) => {
    setLoading(true);
    setError(null);
    try {
      const payload = customPayload || {
        role: roleInput,
        location: locationInput,
        radius: radius,
        job_type: jobType,
        experience_level: expLevel,
        work_mode: workMode,
        salary_range: salaryFilter,
        sort_by: sortBy === 'Newest' ? 'newest' : sortBy.includes('Salary') ? 'salary' : 'best_match',
      };
      const data = await jobService.getRecommendations(payload);
      setRecommendations(data);
      setLastUpdated('Just now');
    } catch (err) {
      console.error(err);
      setError('Failed to load job recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setRefreshing(true);
    setError(null);
    try {
      const payload = {
        role: roleInput.trim() || 'Software Developer',
        location: locationInput.trim() || 'Kochi, Kerala, India',
        radius: radius,
        job_type: jobType,
        experience_level: expLevel,
        work_mode: workMode,
        salary_range: salaryFilter,
        sort_by: sortBy === 'Newest' ? 'newest' : sortBy.includes('Salary') ? 'salary' : 'best_match',
      };
      const data = await jobService.generateRecommendations(payload);
      setRecommendations(data);
      setLastUpdated('Just now');
    } catch (err) {
      console.error(err);
      setError('Failed to search and generate real jobs.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRegenerate = () => {
    handleSearchSubmit();
  };

  const handleClearSidebarFilters = () => {
    setSidebarExp([]);
    setSidebarModes(['On-site', 'Hybrid', 'Remote']);
    setSidebarSalaries([]);
    setWorkMode('All');
    setSalaryFilter('All');
    fetchJobs({
      role: roleInput,
      location: locationInput,
      radius: radius,
      job_type: 'all',
      experience_level: 'All Levels',
      work_mode: 'All',
      salary_range: 'All',
    });
  };

  const toggleSidebarExp = (val) => {
    setSidebarExp((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  const toggleSidebarMode = (val) => {
    setSidebarModes((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  const toggleSidebarSalary = (val) => {
    setSidebarSalaries((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  const handleCopyJob = (title, company) => {
    navigator.clipboard.writeText(`${title} at ${company}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Client-side quick filter / sorting pass
  const displayedJobs = recommendations.filter((rec) => {
    const job = rec.job;
    if (!job) return false;

    // Filter by workMode
    if (workMode !== 'All' && job.work_mode && job.work_mode.toLowerCase() !== workMode.toLowerCase()) {
      return false;
    }

    // Filter by jobType
    if (jobType !== 'all' && job.job_type && job.job_type.toLowerCase() !== jobType.toLowerCase()) {
      return false;
    }

    return true;
  });

  if (loading && recommendations.length === 0) {
    return (
      <PageLayout>
        <LoadingSpinner message={`Scanning real-time career networks in ${locationInput}...`} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Real-Time <span style={{ color: '#22c55e' }}>Job Recommendations</span>
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Find the best career opportunities that match your skills and experience.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Sparkles size={16} />
            <span>{refreshing ? 'Updating Matches...' : 'Regenerate Live Matches'}</span>
          </button>
        </div>

        {error && <ErrorState message={error} onRetry={() => fetchJobs()} />}

        {/* Master Search & Multi-Filter Control Panel */}
        <div
          style={{
            backgroundColor: '#121319',
            border: '1px solid #1e2029',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Row 1: Search Inputs, Radius, Job Type, Exp Level, Search Button */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 1.3fr) minmax(180px, 1.2fr) 110px 130px 140px 130px',
              gap: '12px',
              alignItems: 'flex-end',
            }}
          >
            {/* Job Role / Keywords */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Job Role / Keywords
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  style={{
                    width: '100%',
                    backgroundColor: '#0a0b0e',
                    border: '1px solid #222530',
                    borderRadius: '8px',
                    padding: '9px 34px 9px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '10px' }} />
              </div>
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Location
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="City, State, Country"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  style={{
                    width: '100%',
                    backgroundColor: '#0a0b0e',
                    border: '1px solid #222530',
                    borderRadius: '8px',
                    padding: '9px 30px 9px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
                {locationInput && (
                  <button
                    onClick={() => setLocationInput('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '9px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Radius */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Radius
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0a0b0e',
                  border: '1px solid #222530',
                  borderRadius: '8px',
                  padding: '9px 10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <option value="5 km">5 km</option>
                <option value="10 km">10 km</option>
                <option value="25 km">25 km</option>
                <option value="50 km">50 km</option>
                <option value="100 km">100 km</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0a0b0e',
                  border: '1px solid #222530',
                  borderRadius: '8px',
                  padding: '9px 10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Types</option>
                <option value="full_time">Full-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Experience Level
              </label>
              <select
                value={expLevel}
                onChange={(e) => setExpLevel(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0a0b0e',
                  border: '1px solid #222530',
                  borderRadius: '8px',
                  padding: '9px 10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <option value="All Levels">All Levels</option>
                <option value="0-1 Yrs">0-1 Yrs (Entry)</option>
                <option value="1-3 Yrs">1-3 Yrs</option>
                <option value="3-5 Yrs">3-5 Yrs</option>
                <option value="5-10 Yrs">5-10 Yrs</option>
                <option value="10+ Yrs">10+ Yrs</option>
              </select>
            </div>

            {/* Search Jobs Button */}
            <div>
              <button
                onClick={handleSearchSubmit}
                disabled={refreshing}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#22c55e',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                  transition: 'opacity 0.15s',
                }}
              >
                {refreshing ? <RotateCw size={15} className="animate-spin" /> : <Search size={15} />}
                <span>Search Jobs</span>
              </button>
            </div>
          </div>

          {/* Row 2: Work Mode, Salary Filters & Sort by Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #1a1c24',
            }}
          >
            {/* Left Filter Pills (Work Mode & Salary) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
              {/* Work Mode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Work Mode:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['All', 'On-site', 'Hybrid', 'Remote'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setWorkMode(m)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: workMode === m ? 'rgba(34, 197, 94, 0.12)' : '#181a22',
                        color: workMode === m ? '#22c55e' : 'var(--text-secondary)',
                        border: workMode === m ? '1px solid #22c55e' : '1px solid #242734',
                        transition: 'all 0.15s',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Salary:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['All', '₹0 - ₹6 LPA', '₹6 - ₹12 LPA', '₹12 LPA+'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSalaryFilter(s)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: salaryFilter === s ? 'rgba(34, 197, 94, 0.12)' : '#181a22',
                        color: salaryFilter === s ? '#22c55e' : 'var(--text-secondary)',
                        border: salaryFilter === s ? '1px solid #22c55e' : '1px solid #242734',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sort By */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['Best Match', 'Newest', 'Salary: High to Low'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: sortBy === s ? 'rgba(34, 197, 94, 0.12)' : '#181a22',
                      color: sortBy === s ? '#22c55e' : 'var(--text-secondary)',
                      border: sortBy === s ? '1px solid #22c55e' : '1px solid #242734',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info & Status Indicator Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            padding: '2px 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={15} color="#f59e0b" />
            <span style={{ color: '#fff', fontWeight: 500 }}>
              Showing jobs within <strong style={{ color: '#22c55e' }}>{radius}</strong> of{' '}
              <strong style={{ color: '#fff' }}>{locationInput || 'selected area'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{displayedJobs.length} jobs found</span>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Jobs Grid (Left) + Refine Results Sidebar (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 260px',
            gap: '18px',
            alignItems: 'start',
          }}
        >
          {/* Left: Job Cards Grid */}
          <div>
            {displayedJobs.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                  gap: '16px',
                }}
              >
                {displayedJobs.map((rec) => {
                  const job = rec.job;
                  const linkedInLink = getLinkedInUrl(job.title, job.company);
                  const indeedLink = getIndeedUrl(job.title, job.company, job.location);
                  const applyUrl = job.source === 'Indeed' ? indeedLink : linkedInLink;

                  return (
                    <div
                      key={rec.id}
                      style={{
                        backgroundColor: '#121319',
                        border: '1px solid #1e2029',
                        borderRadius: '12px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'transform 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.35)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#1e2029';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div>
                        {/* Title & Match Score Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <h3
                            style={{
                              fontSize: '0.98rem',
                              fontWeight: 700,
                              color: '#fff',
                              lineHeight: 1.3,
                              cursor: 'pointer',
                            }}
                            onClick={() => setPreviewJobRec(rec)}
                          >
                            {job.title}
                          </h3>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'rgba(34, 197, 94, 0.12)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              color: '#22c55e',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {Math.round(rec.match_score)}% Match
                          </span>
                        </div>

                        {/* Company */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                          <Building size={13} color="var(--text-muted)" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {job.company}
                          </span>
                        </div>

                        {/* Location & Work Mode */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={12} />
                            <span>{job.location || 'Kochi, Kerala'}</span>
                          </div>
                          <span>•</span>
                          <span>{job.work_mode || 'On-site'}</span>
                        </div>

                        {/* Salary & Experience */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', marginTop: '6px' }}>
                          <span style={{ color: '#22c55e', fontWeight: 700 }}>
                            {job.salary_display || (job.salary_min ? `₹${job.salary_min / 100000} - ₹${job.salary_max / 100000} LPA` : '₹6 - ₹10 LPA')}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>•</span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {job.experience_level || '2-5 Yrs Exp'}
                          </span>
                        </div>

                        {/* Snippet Description */}
                        <p
                          style={{
                            fontSize: '0.775rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.45,
                            marginTop: '10px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {job.description || 'Design and develop scalable web applications using modern tech stacks.'}
                        </p>

                        {/* Top Matching Skills */}
                        <div style={{ marginTop: '12px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                            Top Matching Skills:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {rec.matching_skills?.slice(0, 5).map((sk, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.675rem',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: '1px solid rgba(34, 197, 94, 0.25)',
                                  color: '#4ade80',
                                  fontWeight: 600,
                                }}
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons & Source Footer */}
                      <div style={{ marginTop: '10px' }}>
                        {/* Dual Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px' }}>
                          <button
                            onClick={() => setPreviewJobRec(rec)}
                            style={{
                              padding: '7px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#181b24',
                              border: '1px solid #282c3c',
                              color: '#fff',
                              fontSize: '0.775rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'center',
                            }}
                          >
                            View Details
                          </button>

                          <a
                            href={applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                          >
                            <button
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#22c55e',
                                color: '#000',
                                border: 'none',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                              }}
                            >
                              <span>Apply Now</span>
                              <ExternalLink size={13} />
                            </button>
                          </a>
                        </div>

                        {/* Footer: Source & Posted Time */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px solid #1a1c24',
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: job.source === 'Indeed' ? '#2164f3' : '#0a66c2',
                              }}
                            />
                            <span>via {job.source || 'LinkedIn'}</span>
                          </div>
                          <span>{job.posted_time_text || '2h ago'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No Recommended Jobs Found"
                description={`No active openings matching "${roleInput}" within ${radius} of ${locationInput}.`}
                actionLabel="Reset Filters & Search"
                actionIcon={Sparkles}
                onAction={handleClearSidebarFilters}
              />
            )}
          </div>

          {/* Right: Refine Results Filter Sidebar */}
          <div
            style={{
              backgroundColor: '#121319',
              border: '1px solid #1e2029',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Sidebar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Refine Results</h3>
              <button
                onClick={handleClearSidebarFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#22c55e',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            </div>

            {/* Location Tag */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Location
              </label>
              <div
                style={{
                  backgroundColor: '#0a0b0e',
                  border: '1px solid #222530',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.775rem',
                  color: '#fff',
                }}
              >
                <span>{locationInput || 'Kochi, Kerala, India'}</span>
                <X size={13} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setLocationInput('')} />
              </div>
              <span
                onClick={() => setLocationInput('Bangalore, Karnataka, India')}
                style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block', cursor: 'pointer' }}
              >
                + Add another location
              </span>
            </div>

            {/* Radius Slider */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Radius
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="20"
                value={radius === '5 km' ? 5 : radius === '25 km' ? 25 : radius === '50 km' ? 50 : 100}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRadius(val <= 15 ? '5 km' : val <= 35 ? '25 km' : val <= 65 ? '50 km' : '100 km');
                }}
                style={{ width: '100%', accentColor: '#22c55e', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>5 km</span>
                <span style={{ color: radius === '25 km' ? '#22c55e' : 'inherit', fontWeight: radius === '25 km' ? 700 : 400 }}>25 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Experience (Years) Checkboxes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Experience (Years)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: '0-1', label: '0 - 1' },
                  { id: '1-3', label: '1 - 3' },
                  { id: '3-5', label: '3 - 5' },
                  { id: '5-10', label: '5 - 10' },
                  { id: '10+', label: '10+' },
                ].map((exp) => (
                  <label
                    key={exp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.775rem',
                      color: sidebarExp.includes(exp.id) ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sidebarExp.includes(exp.id)}
                      onChange={() => toggleSidebarExp(exp.id)}
                      style={{ accentColor: '#22c55e', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                    <span>{exp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode Checkboxes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Work Mode
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['On-site', 'Hybrid', 'Remote'].map((mode) => (
                  <label
                    key={mode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.775rem',
                      color: sidebarModes.includes(mode) ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sidebarModes.includes(mode)}
                      onChange={() => toggleSidebarMode(mode)}
                      style={{ accentColor: '#22c55e', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range (Per Annum) Checkboxes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Salary Range (Per Annum)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: '0-6', label: '₹0 - ₹6 LPA' },
                  { id: '6-12', label: '₹6 - ₹12 LPA' },
                  { id: '12-20', label: '₹12 - ₹20 LPA' },
                  { id: '20+', label: '₹20 LPA+' },
                ].map((sal) => (
                  <label
                    key={sal.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.775rem',
                      color: sidebarSalaries.includes(sal.id) ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sidebarSalaries.includes(sal.id)}
                      onChange={() => toggleSidebarSalary(sal.id)}
                      style={{ accentColor: '#22c55e', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                    <span>{sal.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={handleSearchSubmit}
              disabled={refreshing}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: '#22c55e',
                color: '#000',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: 'none',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Detailed Real Job Preview Modal */}
        {previewJobRec && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setPreviewJobRec(null)}
          >
            <div
              style={{
                maxWidth: '680px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                backgroundColor: '#121319',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.85)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewJobRec(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#181b24',
                      color: '#22c55e',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    {Math.round(previewJobRec.match_score)}% Skill Match
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    • {previewJobRec.job?.work_mode || 'On-site'} • {previewJobRec.job?.experience_level || '2-5 Yrs Exp'}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  {previewJobRec.job?.title}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Building size={15} color="#22c55e" />
                    <span style={{ fontWeight: 600, color: '#fff' }}>{previewJobRec.job?.company}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={15} />
                    <span>{previewJobRec.job?.location || 'Kochi, Kerala'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontWeight: 700 }}>
                    <DollarSign size={15} />
                    <span>{previewJobRec.job?.salary_display || '₹6 - ₹10 LPA'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: '14px', backgroundColor: '#0c0d12', borderRadius: '8px', border: '1px solid #1e2029' }}>
                <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Role Overview & Architecture Scope
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {previewJobRec.job?.description}
                </p>
              </div>

              {/* Core Requirements */}
              {previewJobRec.job?.requirements?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Key Role Requirements & Stack:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {previewJobRec.job.requirements.map((req, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#fff' }}>
                        <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified vs Missing Skills Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* Matching Skills */}
                <div style={{ padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Verified Match ({previewJobRec.matching_skills?.length || 0})
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {previewJobRec.matching_skills?.map((sk, idx) => (
                      <span key={idx} style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 600 }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Recommended to Learn ({previewJobRec.missing_skills?.length || 0})
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {previewJobRec.missing_skills?.length > 0 ? (
                      previewJobRec.missing_skills.map((sk, idx) => (
                        <span key={idx} style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 600 }}>
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        All core skills verified!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Application Gateways (LinkedIn & Indeed) */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #1e2029', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Live Application Gateways:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <a
                    href={getLinkedInUrl(previewJobRec.job?.title, previewJobRec.job?.company)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#0a66c2',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>Apply on LinkedIn</span>
                      <ExternalLink size={16} />
                    </button>
                  </a>

                  <a
                    href={getIndeedUrl(previewJobRec.job?.title, previewJobRec.job?.company, previewJobRec.job?.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#2164f3',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>Apply on Indeed</span>
                      <ExternalLink size={16} />
                    </button>
                  </a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <a
                    href={getGoogleJobsUrl(previewJobRec.job?.title, previewJobRec.job?.company)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.775rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'underline',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Search Google Jobs network</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={() => handleCopyJob(previewJobRec.job?.title, previewJobRec.job?.company)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: copied ? '#22c55e' : 'var(--text-muted)',
                      fontSize: '0.775rem',
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Job Info'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default JobRecommendations;
