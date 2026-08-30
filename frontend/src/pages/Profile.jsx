import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  Phone,
  Globe,
  Code2,
  Link2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Award,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { authService } from '../services/authService';
import { skillService } from '../services/skillService';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);

  // Add skill form state
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState('intermediate');

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prof, rolesData, allSkills, uSkills] = await Promise.all([
        authService.getProfile(),
        skillService.getJobRoles(),
        skillService.getSkills(),
        skillService.getUserSkills(),
      ]);
      setProfileData(prof);
      setRoles(rolesData);
      setAvailableSkills(allSkills);
      setUserSkills(uSkills);
      if (allSkills.length > 0) setSelectedSkillId(allSkills[0].id);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      user: { ...prev.user, [name]: value },
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError(null);
    try {
      const payload = {
        first_name: profileData.user?.first_name || '',
        last_name: profileData.user?.last_name || '',
        email: profileData.user?.email || '',
        bio: profileData.bio || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        linkedin_url: profileData.linkedin_url || '',
        github_url: profileData.github_url || '',
        portfolio_url: profileData.portfolio_url || '',
        target_role: profileData.target_role || null,
        years_experience: Number(profileData.years_experience) || 0,
        education_level: profileData.education_level || 'bachelor',
      };

      const updated = await authService.updateProfile(payload);
      setProfileData(updated);
      await refreshProfile();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;
    try {
      await skillService.addUserSkill(selectedSkillId, proficiency);
      const updatedSkills = await skillService.getUserSkills();
      setUserSkills(updatedSkills);
    } catch (err) {
      console.error(err);
      alert('Skill already added or invalid.');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await skillService.deleteUserSkill(id);
      setUserSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to remove skill.');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Loading your career credentials..." />
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
              Career Profile & Credentials
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Manage your target role, professional background, and verified skill matrix.
            </p>
          </div>
        </div>

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--neon-green-bg)',
              color: 'var(--neon-green)',
              border: '1px solid var(--neon-green-border)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && <ErrorState message={error} onRetry={fetchProfileData} />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Left Form: Personal & Career Info */}
          <Card title="Personal & Career Information" subtitle="Used to calibrate AI recommendations" icon={User}>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input
                  label="First Name"
                  name="first_name"
                  value={profileData?.user?.first_name || ''}
                  onChange={handleUserFieldChange}
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={profileData?.user?.last_name || ''}
                  onChange={handleUserFieldChange}
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                icon={Mail}
                type="email"
                value={profileData?.user?.email || ''}
                onChange={handleUserFieldChange}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input
                  label="Location"
                  name="location"
                  icon={MapPin}
                  placeholder="e.g. San Francisco, CA"
                  value={profileData?.location || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  icon={Phone}
                  placeholder="+1 (555) 000-0000"
                  value={profileData?.phone || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Target Job Role
                </label>
                <select
                  className="input-field"
                  name="target_role"
                  value={profileData?.target_role || ''}
                  onChange={handleChange}
                >
                  <option value="">-- Select Target Role --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Years of Experience
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    max="50"
                    name="years_experience"
                    value={profileData?.years_experience || 0}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Education Level
                  </label>
                  <select
                    className="input-field"
                    name="education_level"
                    value={profileData?.education_level || 'bachelor'}
                    onChange={handleChange}
                  >
                    <option value="high_school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="bootcamp">Bootcamp Graduate</option>
                    <option value="self_taught">Self-Taught</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Professional Bio
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  name="bio"
                  placeholder="Summary of your background, passions, and career goals..."
                  value={profileData?.bio || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Social URLs */}
              <Input
                label="LinkedIn Profile"
                name="linkedin_url"
                icon={Link2}
                placeholder="https://linkedin.com/in/yourname"
                value={profileData?.linkedin_url || ''}
                onChange={handleChange}
              />
              <Input
                label="GitHub Profile"
                name="github_url"
                icon={Code2}
                placeholder="https://github.com/yourname"
                value={profileData?.github_url || ''}
                onChange={handleChange}
              />
              <Input
                label="Portfolio Website"
                name="portfolio_url"
                icon={Globe}
                placeholder="https://yourportfolio.dev"
                value={profileData?.portfolio_url || ''}
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Save}
                loading={saving}
                style={{ marginTop: '8px' }}
              >
                Save Profile Changes
              </Button>
            </form>
          </Card>

          {/* Right Column: User Skills Inventory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="Verified Skill Matrix" subtitle={`${userSkills.length} active skill(s) registered`} icon={Award}>
              {/* Add Skill Widget */}
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ flex: 2, minWidth: '150px' }}>
                  <select
                    className="input-field"
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                  >
                    {availableSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category_name || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '110px' }}>
                  <select
                    className="input-field"
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" icon={Plus}>
                  Add Skill
                </Button>
              </form>

              {/* Skills List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                {userSkills.map((us) => (
                  <div
                    key={us.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#111218',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {us.skill_name}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        via {us.source}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge
                        variant={
                          us.proficiency_level === 'expert' || us.proficiency_level === 'advanced'
                            ? 'primary'
                            : us.proficiency_level === 'intermediate'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {us.proficiency_level}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(us.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Remove skill"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
