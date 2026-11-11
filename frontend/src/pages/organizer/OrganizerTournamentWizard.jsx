import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Input,
  Select,
  Textarea,
  PrimaryButton,
  SecondaryButton,
  Badge,
  SectionHeader,
  SkeletonLoader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerTournamentWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [games, setGames] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    gameId: '',
    organizationId: '',
    participationType: 'TEAM',
    teamSize: 5,
    minParticipants: 4,
    maxParticipants: 16,
    format: 'SINGLE_ELIMINATION',
    groupCount: 2,
    advancePerGroup: 2,
    registrationStart: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    rules: '',
    bannerUrl: '',
    prizePool: '',
    prizeCurrency: 'USD',
  });

  useEffect(() => {
    async function loadMetadata() {
      setLoading(true);
      try {
        const [gamesList, orgsList] = await Promise.all([
          evoqService.getGames(),
          evoqService.getMyOrganizations().catch(() => []),
        ]);
        setGames(gamesList || []);
        if (gamesList && gamesList.length > 0) {
          setForm((prev) => ({ ...prev, gameId: gamesList[0].id }));
        }
        setOrganizations(orgsList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? (value ? Number(value) : '') : value,
      };
      if (name === 'name' && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const validateStep = (s) => {
    setError('');
    if (s === 1) {
      if (!form.name.trim()) {
        setError('Tournament event name is required.');
        return false;
      }
      if (!form.slug.trim()) {
        setError('Custom slug identifier is required.');
        return false;
      }
    } else if (s === 2) {
      if (!form.gameId) {
        setError('Please select an esports game title.');
        return false;
      }
    } else if (s === 3) {
      if (form.participationType === 'TEAM' && (!form.teamSize || form.teamSize < 1)) {
        setError('Team size must be at least 1 player.');
        return false;
      }
      if (!form.maxParticipants || form.maxParticipants < 2) {
        setError('Maximum participants must be at least 2.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 9));
    }
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description || undefined,
        gameId: form.gameId,
        organizationId: form.organizationId || undefined,
        participationType: form.participationType,
        teamSize: form.participationType === 'TEAM' ? Number(form.teamSize) : 1,
        minParticipants: Number(form.minParticipants) || 4,
        maxParticipants: Number(form.maxParticipants) || 16,
        format: form.format,
        groupCount: ['ROUND_ROBIN', 'GROUP_STAGE_TO_KNOCKOUT'].includes(form.format) ? Number(form.groupCount) : undefined,
        advancePerGroup: ['ROUND_ROBIN', 'GROUP_STAGE_TO_KNOCKOUT'].includes(form.format) ? Number(form.advancePerGroup) : undefined,
        registrationStart: form.registrationStart ? new Date(form.registrationStart).toISOString() : new Date().toISOString(),
        registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : new Date(Date.now() + 86400000 * 7).toISOString(),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date(Date.now() + 86400000 * 8).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        rules: form.rules || undefined,
        bannerUrl: form.bannerUrl || undefined,
        prizePool: form.prizePool ? Number(form.prizePool) : undefined,
        prizeCurrency: form.prizeCurrency || 'USD',
      };

      const created = await evoqService.createTournament(payload);
      navigate(`/organizer/tournaments/${created.slug || created.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to create tournament.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    'Basic Info',
    'Game Title',
    'Registration',
    'Format',
    'Stages & Groups',
    'Schedule',
    'Rules & Conduct',
    'Media & Prizes',
    'Review & Deploy',
  ];

  return (
    <OrganizerLayout
      title="Tournament Creation Wizard"
      actions={
        <Link to="/organizer/tournaments" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
          Cancel
        </Link>
      }
    >
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* ── Progress Indicators ── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="evoq-mono-label" style={{ color: 'var(--evoq-lime)' }}>
              STAGE {step} OF 9: {stepsList[step - 1].toUpperCase()}
            </span>
            <span className="evoq-mono-label">
              {Math.round((step / 9) * 100)}% COMPLETE
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {stepsList.map((label, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < step;
              const isCurrent = stepNum === step;

              return (
                <div
                  key={label}
                  title={`${stepNum}. ${label}`}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: isCurrent ? 'var(--evoq-lime)' : isCompleted ? '#22D3EE' : 'var(--evoq-border)',
                    transition: 'background-color 0.2s',
                  }}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="x" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Wizard Form Container ── */}
        <div className="evoq-card" style={{ marginBottom: '24px' }}>
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div>
              <SectionHeader
                title="Tournament Overview"
                subtitle="Event title, public slug identifier, and brief description"
              />
              <Input
                label="Tournament Event Title"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. EVOQ Champions Invitational 2026"
                required
              />
              <Input
                label="Custom URL Slug Identifier"
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="e.g. evoq-champions-2026"
                required
                helperText="Permanent public URL: evoq.gg/tournaments/{slug}"
              />
              <Textarea
                label="Event Description"
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your tournament, competitive atmosphere, and broadcast details..."
              />
            </div>
          )}

          {/* STEP 2: GAME & ORG */}
          {step === 2 && (
            <div>
              <SectionHeader
                title="Game Title & Host Organization"
                subtitle="Select the title and hosting club entity"
              />
              <Select
                label="Esports Game Title"
                id="gameId"
                name="gameId"
                value={form.gameId}
                onChange={handleChange}
                required
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>

              {organizations.length > 0 && (
                <Select
                  label="Host Organization (Optional)"
                  id="organizationId"
                  name="organizationId"
                  value={form.organizationId}
                  onChange={handleChange}
                  placeholder="Personal Organizer Account"
                >
                  {organizations.map((org) => {
                    const orgObj = org.organization || org;
                    return (
                      <option key={orgObj.id} value={orgObj.id}>
                        {orgObj.name}
                      </option>
                    );
                  })}
                </Select>
              )}
            </div>
          )}

          {/* STEP 3: REGISTRATION */}
          {step === 3 && (
            <div>
              <SectionHeader
                title="Registration & Roster Settings"
                subtitle="Solo or Squad entry, team roster sizes, and capacity"
              />
              <Select
                label="Participation Type"
                id="participationType"
                name="participationType"
                value={form.participationType}
                onChange={handleChange}
              >
                <option value="TEAM">Team / Squad Tournament</option>
                <option value="SOLO">Solo Competitor Tournament</option>
              </Select>

              {form.participationType === 'TEAM' && (
                <Input
                  label="Starters Per Team Roster"
                  id="teamSize"
                  name="teamSize"
                  type="number"
                  min="1"
                  max="10"
                  value={form.teamSize}
                  onChange={handleChange}
                  helperText="Standard starting players per squad (e.g. 5 for tactical FPS)."
                />
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  label="Min Participants"
                  id="minParticipants"
                  name="minParticipants"
                  type="number"
                  min="2"
                  value={form.minParticipants}
                  onChange={handleChange}
                />
                <Input
                  label="Max Tournament Slots"
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="2"
                  max="128"
                  value={form.maxParticipants}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* STEP 4: FORMAT */}
          {step === 4 && (
            <div>
              <SectionHeader
                title="Competition Bracket Format"
                subtitle="Choose the mathematical bracket elimination algorithm"
              />
              <Select
                label="Tournament Format"
                id="format"
                name="format"
                value={form.format}
                onChange={handleChange}
              >
                <option value="SINGLE_ELIMINATION">Single Elimination (Knockout)</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination (Upper & Lower Brackets)</option>
                <option value="ROUND_ROBIN">Round Robin</option>
                <option value="SWISS">Swiss System</option>
              </Select>
            </div>
          )}

          {/* STEP 5: GROUPS & STAGES */}
          {step === 5 && (
            <div>
              <SectionHeader
                title="Groups & Advancements"
                subtitle="Configure multi-group qualifiers if applicable"
              />
              {['ROUND_ROBIN', 'GROUP_STAGE_TO_KNOCKOUT'].includes(form.format) ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Number of Groups"
                    id="groupCount"
                    name="groupCount"
                    type="number"
                    min="1"
                    max="16"
                    value={form.groupCount}
                    onChange={handleChange}
                  />
                  <Input
                    label="Advance Per Group"
                    id="advancePerGroup"
                    name="advancePerGroup"
                    type="number"
                    min="1"
                    max="8"
                    value={form.advancePerGroup}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <p style={{ color: 'var(--evoq-text-muted)', fontSize: '0.9rem', margin: '8px 0' }}>
                  No group stage configuration is needed for <strong>{form.format.replace(/_/g, ' ')}</strong>. You can proceed to schedule settings.
                </p>
              )}
            </div>
          )}

          {/* STEP 6: SCHEDULE */}
          {step === 6 && (
            <div>
              <SectionHeader
                title="Tournament Schedule & Windows"
                subtitle="Set registration deadlines and match execution dates"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  label="Registration Deadline"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="datetime-local"
                  value={form.registrationDeadline}
                  onChange={handleChange}
                />
                <Input
                  label="Competition Start Date"
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* STEP 7: RULES */}
          {step === 7 && (
            <div>
              <SectionHeader
                title="Tournament Rules & Integrity Code"
                subtitle="Authoritative player rules, anti-cheat policy, and dispute guidelines"
              />
              <Textarea
                label="Official Rules Text"
                id="rules"
                name="rules"
                value={form.rules}
                onChange={handleChange}
                rows={6}
                placeholder="Include match settings, pause rules, map veto procedure, and disconnection policies..."
              />
            </div>
          )}

          {/* STEP 8: MEDIA & PRIZES */}
          {step === 8 && (
            <div>
              <SectionHeader
                title="Media Banner & Prize Purse"
                subtitle="Add high-impact visual banners and prize pool disclosure"
              />
              <Input
                label="Tournament Header Banner URL"
                id="bannerUrl"
                name="bannerUrl"
                value={form.bannerUrl}
                onChange={handleChange}
                placeholder="https://example.com/banner.png"
                helperText="Recommended dimension: 1920x600px."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <Input
                  label="Prize Pool Amount (Optional)"
                  id="prizePool"
                  name="prizePool"
                  type="number"
                  value={form.prizePool}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                />
                <Select
                  label="Currency"
                  id="prizeCurrency"
                  name="prizeCurrency"
                  value={form.prizeCurrency}
                  onChange={handleChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 9: REVIEW & DEPLOY */}
          {step === 9 && (
            <div>
              <SectionHeader
                title="Review & Deploy Event"
                subtitle="Verify all parameters before launching to the EVOQ network"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: 'var(--evoq-surface-elevated)', padding: '12px 14px', borderRadius: 'var(--evoq-radius-sm)' }}>
                  <span className="evoq-mono-label">EVENT TITLE</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', marginTop: '3px' }}>{form.name}</div>
                </div>

                <div style={{ backgroundColor: 'var(--evoq-surface-elevated)', padding: '12px 14px', borderRadius: 'var(--evoq-radius-sm)' }}>
                  <span className="evoq-mono-label">SLUG IDENTIFIER</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-lime)', marginTop: '3px' }}>/{form.slug}</div>
                </div>

                <div style={{ backgroundColor: 'var(--evoq-surface-elevated)', padding: '12px 14px', borderRadius: 'var(--evoq-radius-sm)' }}>
                  <span className="evoq-mono-label">FORMAT</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', marginTop: '3px' }}>{form.format.replace(/_/g, ' ')}</div>
                </div>

                <div style={{ backgroundColor: 'var(--evoq-surface-elevated)', padding: '12px 14px', borderRadius: 'var(--evoq-radius-sm)' }}>
                  <span className="evoq-mono-label">CAPACITY</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', marginTop: '3px' }}>
                    {form.maxParticipants} {form.participationType === 'TEAM' ? 'Teams' : 'Players'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Wizard Controls Bar ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--evoq-border-subtle)' }}>
            {step > 1 ? (
              <SecondaryButton onClick={handlePrev} icon="arrow-left">
                Previous Stage
              </SecondaryButton>
            ) : (
              <div />
            )}

            {step < 9 ? (
              <PrimaryButton onClick={handleNext} iconRight="arrow-right">
                Continue to Stage {step + 1}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handlePublish}
                disabled={submitting}
                loading={submitting}
                iconRight="check"
                size="lg"
              >
                {submitting ? 'Deploying Event...' : 'Deploy Tournament to Arena'}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
