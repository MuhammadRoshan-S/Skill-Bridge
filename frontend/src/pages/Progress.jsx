import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Target,
  MessagesSquare,
  Compass,
  FileText,
  CheckCircle,
  Download,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import StatCard from '../components/charts/StatCard';
import SpeedometerGauge from '../components/charts/SpeedometerGauge';
import VelocityForecastChart from '../components/charts/VelocityForecastChart';
import PipelineStageChart from '../components/charts/PipelineStageChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { dashboardService } from '../services/dashboardService';
import { skillService } from '../services/skillService';

const Progress = () => {
  const [data, setData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgressData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, userSkills] = await Promise.all([
        dashboardService.getDashboardData(),
        skillService.getUserSkills(),
      ]);
      setData(dashData);
      setSkills(userSkills);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch career analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Aggregating performance analytics..." />
      </PageLayout>
    );
  }

  // Calculate skill proficiency breakdown
  const profCounts = {
    expert: skills.filter((s) => s.proficiency_level === 'expert').length,
    advanced: skills.filter((s) => s.proficiency_level === 'advanced').length,
    intermediate: skills.filter((s) => s.proficiency_level === 'intermediate').length,
    beginner: skills.filter((s) => s.proficiency_level === 'beginner').length,
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Performance & Career Telemetry
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Deep data metrics across resume strength, market skill fit, curriculum progress, and interview readiness.
            </p>
          </div>

          <Button variant="secondary" icon={Download} onClick={handlePrintReport}>
            Export Summary Report
          </Button>
        </div>

        {error && <ErrorState message={error} onRetry={fetchProgressData} />}

        {/* 4 Core Pillars (Using Reference StatCards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <StatCard
            title="Readiness Index"
            value={`${data?.career_readiness || 84}%`}
            trend="14.2%"
            trendDirection="up"
            subtitle="Weighted aggregate readiness"
          />
          <StatCard
            title="Verified Skills"
            value={skills.length}
            trend="8 New"
            trendDirection="up"
            subtitle={`${profCounts.advanced + profCounts.expert} senior/lead competencies`}
          />
          <StatCard
            title="Roadmap Velocity"
            value={`${data?.learning_progress || 68}%`}
            trend="18.5%"
            trendDirection="up"
            subtitle={`${data?.resources_completed || 0} modules completed`}
          />
          <StatCard
            title="Interview Score"
            value={data?.avg_interview_score ? `${Math.round(data.avg_interview_score)}%` : '92%'}
            trend="95%"
            trendDirection="confidence"
            subtitle={`${data?.completed_interviews || 4} evaluated sessions`}
          />
        </div>

        {/* Mid Row: Velocity Chart + Speedometer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          <div style={{ flex: '1 1 60%' }}>
            <VelocityForecastChart
              title="Career Velocity & Forecast Trajectory"
              dataPoints={[
                { month: 'Jan', val: 420, label: 'Jan/26', sub: 'Index: 68%' },
                { month: 'Feb', val: 510, label: 'Feb/26', sub: 'Index: 74%' },
                { month: 'Mar', val: 580, label: 'Mar/26', sub: 'Index: 79%' },
                { month: 'Apr', val: 690, label: 'April/26', sub: 'Index: 86%' },
                { month: 'May', val: 660, label: 'May/26', sub: 'Index: 84%' },
                { month: 'Jun', val: 780, label: 'Jun/26', sub: 'Index: 91%' },
                { month: 'Jul', val: 860, label: 'Jul/26', sub: 'Index: 95%' },
              ]}
              activeMonthIndex={3}
            />
          </div>

          <div style={{ flex: '1 1 40%' }}>
            <SpeedometerGauge
              title="Role Readiness Benchmark"
              value={data?.career_readiness || 78}
              target={90}
              targetText="On track for 90% target"
            />
          </div>
        </div>

        {/* Readiness Breakdown & Visual Gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Readiness Pillars */}
          <Card title="Career Readiness Pillars" subtitle="Weight breakdown of your career intelligence score" icon={TrendingUp}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>1. Resume Quality & ATS Optimization (25%)</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{data?.resume_score || 88}%</span>
                </div>
                <ProgressBar value={data?.resume_score || 88} variant="primary" striped height="8px" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>2. Target Role Skill Match (30%)</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{data?.skill_match?.percentage || 78}%</span>
                </div>
                <ProgressBar value={data?.skill_match?.percentage || 78} variant="cyan" striped height="8px" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>3. Learning Roadmap Completion (25%)</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{data?.learning_progress || 68}%</span>
                </div>
                <ProgressBar value={data?.learning_progress || 68} variant="purple" striped height="8px" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>4. Mock Interview Evaluation (20%)</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{data?.avg_interview_score || 92}%</span>
                </div>
                <ProgressBar value={data?.avg_interview_score || 92} variant="green" striped height="8px" />
              </div>
            </div>
          </Card>

          {/* Skill Proficiency Distribution */}
          <Card title="Skill Proficiency Distribution" subtitle="Breakdown of your verified skills" icon={Target}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Expert</span>
                </div>
                <span className="badge badge-primary">{profCounts.expert} skill(s)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Advanced</span>
                </div>
                <span className="badge badge-info">{profCounts.advanced} skill(s)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Intermediate</span>
                </div>
                <span className="badge badge-success">{profCounts.intermediate} skill(s)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#facc15' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Beginner</span>
                </div>
                <span className="badge badge-warning">{profCounts.beginner} skill(s)</span>
              </div>
            </div>

            {/* List of Skills Chips */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skills.map((s) => (
                  <Badge
                    key={s.id}
                    variant={
                      s.proficiency_level === 'expert' || s.proficiency_level === 'advanced'
                        ? 'primary'
                        : s.proficiency_level === 'intermediate'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {s.skill_name} ({s.proficiency_level})
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Progress;
