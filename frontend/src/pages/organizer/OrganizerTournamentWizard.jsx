import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import api from '../../services/api.js';
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

const GAME_PRESETS = {
  'free-fire': {
    name: 'Free Fire',
    modes: [
      {
        id: 'battle-royale',
        name: 'Battle Royale',
        matchEngine: 'BATTLE_ROYALE',
        defaultTeamSize: 4,
        teamsPerLobby: 12,
        formats: ['GROUP_STAGE_FINALS', 'POINTS_TABLE', 'GROUP_STAGE', 'CUSTOM'],
        defaultFormat: 'GROUP_STAGE_FINALS',
        defaultMaps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine'],
        placementPoints: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0 },
        eliminationPoints: 1,
      },
      {
        id: 'clash-squad',
        name: 'Clash Squad (4v4)',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 4,
        formats: ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'CUSTOM'],
        defaultFormat: 'SINGLE_ELIMINATION',
        defaultSeries: 'BO3',
        defaultMaps: ['Bermuda CS', 'Kalahari CS', 'Purgatory CS'],
      },
    ],
  },
  bgmi: {
    name: 'BGMI',
    modes: [
      {
        id: 'battle-royale',
        name: 'Battle Royale (Squad)',
        matchEngine: 'BATTLE_ROYALE',
        defaultTeamSize: 4,
        teamsPerLobby: 16,
        formats: ['GROUP_STAGE_FINALS', 'POINTS_TABLE', 'GROUP_STAGE', 'CUSTOM'],
        defaultFormat: 'GROUP_STAGE_FINALS',
        defaultMaps: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi'],
        placementPoints: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 },
        eliminationPoints: 1,
      },
    ],
  },
  valorant: {
    name: 'Valorant',
    modes: [
      {
        id: 'competitive-5v5',
        name: '5v5 Competitive Mode',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 5,
        formats: ['DOUBLE_ELIMINATION', 'SINGLE_ELIMINATION', 'SWISS', 'ROUND_ROBIN', 'CUSTOM'],
        defaultFormat: 'DOUBLE_ELIMINATION',
        defaultSeries: 'BO3',
        defaultMaps: ['Ascent', 'Bind', 'Haven', 'Split', 'Lotus', 'Sunset', 'Abyss'],
      },
    ],
  },
  cs2: {
    name: 'Counter-Strike 2',
    modes: [
      {
        id: 'competitive-5v5',
        name: '5v5 Competitive Mode',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 5,
        formats: ['DOUBLE_ELIMINATION', 'SINGLE_ELIMINATION', 'SWISS', 'ROUND_ROBIN', 'CUSTOM'],
        defaultFormat: 'DOUBLE_ELIMINATION',
        defaultSeries: 'BO3',
        defaultMaps: ['Mirage', 'Inferno', 'Nuke', 'Dust II', 'Anubis', 'Ancient', 'Vertigo'],
      },
    ],
  },
  'call-of-duty': {
    name: 'Call of Duty: Mobile',
    modes: [
      {
        id: 'multiplayer-5v5',
        name: 'Multiplayer (5v5 Search & Destroy / Hardpoint)',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 5,
        formats: ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'CUSTOM'],
        defaultFormat: 'SINGLE_ELIMINATION',
        defaultSeries: 'BO3',
        defaultMaps: ['Firing Range', 'Summit', 'Raid', 'Standoff', 'Crash'],
      },
      {
        id: 'battle-royale',
        name: 'Battle Royale (Squad)',
        matchEngine: 'BATTLE_ROYALE',
        defaultTeamSize: 4,
        teamsPerLobby: 16,
        formats: ['GROUP_STAGE_FINALS', 'POINTS_TABLE', 'CUSTOM'],
        defaultFormat: 'POINTS_TABLE',
        defaultMaps: ['Isolated', 'Blackout'],
        placementPoints: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 0, 10: 0 },
        eliminationPoints: 1,
      },
    ],
  },
};

export default function OrganizerTournamentWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [games, setGames] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Basic Information
    name: '',
    slug: '',
    description: '',
    bannerUrl: '',
    thumbnailUrl: '',
    organizationId: '',
    rules: '',
    visibility: 'PUBLIC',

    // Step 2: Event Type
    locationMode: 'ONLINE', // ONLINE or LAN

    // Step 3: Game & Mode
    gameId: '',
    gameSlug: '',
    gameMode: 'battle-royale',
    matchEngine: 'BATTLE_ROYALE', // BATTLE_ROYALE or HEAD_TO_HEAD

    // Step 4: Participation Configuration
    participationType: 'TEAM',
    teamSize: 4,
    minParticipants: 4,
    maxParticipants: 16,

    // Step 5: Competition Format
    format: 'GROUP_STAGE_FINALS',

    // Step 6: Rules & Scoring Presets
    teamsPerLobby: 12,
    matchesPerGroup: 3,
    eliminationPoints: 1,
    seriesFormat: 'BO3',
    selectedMaps: ['Map 1', 'Map 2', 'Map 3'],

    // Step 7: Schedule & Prize
    registrationStart: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    timezone: 'UTC',
    prizePool: '',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [gamesList, orgsList] = await Promise.all([
          evoqService.getGames(),
          evoqService.getMyOrganizations().catch(() => []),
        ]);
        setGames(gamesList || []);
        setOrganizations(orgsList || []);

        if (gamesList && gamesList.length > 0) {
          const firstGame = gamesList[0];
          applyGameDefaults(firstGame.id, firstGame.slug);
        }
      } catch (err) {
        console.error('Failed to load wizard metadata:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const applyGameDefaults = (gameId, gameSlug) => {
    const slug = gameSlug || games.find((g) => g.id === gameId)?.slug || 'free-fire';
    const preset = GAME_PRESETS[slug] || GAME_PRESETS['free-fire'];
    const mode = preset.modes[0];

    setForm((prev) => ({
      ...prev,
      gameId,
      gameSlug: slug,
      gameMode: mode.id,
      matchEngine: mode.matchEngine,
      teamSize: mode.defaultTeamSize,
      format: mode.defaultFormat,
      teamsPerLobby: mode.teamsPerLobby || 12,
      eliminationPoints: mode.eliminationPoints || 1,
      seriesFormat: mode.defaultSeries || 'BO3',
      selectedMaps: mode.defaultMaps || ['Map 1', 'Map 2', 'Map 3'],
      maxParticipants: mode.matchEngine === 'BATTLE_ROYALE' ? (mode.teamsPerLobby ? mode.teamsPerLobby * 2 : 24) : 16,
    }));
  };

  const handleGameChange = (e) => {
    const gameId = e.target.value;
    const gameObj = games.find((g) => g.id === gameId);
    applyGameDefaults(gameId, gameObj?.slug);
  };

  const handleModeChange = (e) => {
    const modeId = e.target.value;
    const preset = GAME_PRESETS[form.gameSlug];
    if (!preset) return;
    const mode = preset.modes.find((m) => m.id === modeId);
    if (!mode) return;

    setForm((prev) => ({
      ...prev,
      gameMode: mode.id,
      matchEngine: mode.matchEngine,
      teamSize: mode.defaultTeamSize,
      format: mode.defaultFormat,
      teamsPerLobby: mode.teamsPerLobby || 12,
      eliminationPoints: mode.eliminationPoints || 1,
      seriesFormat: mode.defaultSeries || 'BO3',
      selectedMaps: mode.defaultMaps || ['Map 1', 'Map 2', 'Map 3'],
      maxParticipants: mode.matchEngine === 'BATTLE_ROYALE' ? (mode.teamsPerLobby ? mode.teamsPerLobby * 2 : 24) : 16,
    }));
  };

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

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target.result;
          const res = await api.post('/media/upload', {
            dataUrl: base64,
            filename: file.name,
          });
          const url = res.data?.data?.url || res.data?.url;
          if (url) {
            setForm((prev) => ({ ...prev, [field]: url }));
          }
        } catch (uploadErr) {
          setError('File upload failed.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('File read failed.');
    }
  };

  const validateStep = (s) => {
    setError('');
    if (s === 1) {
      if (!form.name.trim()) {
        setError('Tournament name is required.');
        return false;
      }
      if (!form.slug.trim()) {
        setError('Tournament slug identifier is required.');
        return false;
      }
    } else if (s === 2) {
      if (form.locationMode === 'LAN') {
        setError('OFFLINE / LAN tournament engine requires the EVOQ LAN Sidecar (Coming in V2). Please choose ONLINE to proceed.');
        return false;
      }
    } else if (s === 3) {
      if (!form.gameId) {
        setError('Please select an esports title.');
        return false;
      }
    } else if (s === 4) {
      if (form.maxParticipants < 2) {
        setError('Maximum participants must be at least 2.');
        return false;
      }
    } else if (s === 7) {
      if (!form.registrationStart || !form.registrationDeadline || !form.startDate) {
        setError('Registration start, deadline, and tournament start dates are required.');
        return false;
      }
      if (new Date(form.registrationStart) >= new Date(form.registrationDeadline)) {
        setError('Registration start must precede registration deadline.');
        return false;
      }
      if (new Date(form.registrationDeadline) > new Date(form.startDate)) {
        setError('Registration deadline must precede tournament start date.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((p) => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setError('');
    setStep((p) => p - 1);
    window.scrollTo(0, 0);
  };

  const handleSave = async (isPublish = false) => {
    if (!validateStep(7)) return;
    setSubmitting(true);
    setError('');

    try {
      const activePreset = GAME_PRESETS[form.gameSlug];
      const activeMode = activePreset?.modes.find((m) => m.id === form.gameMode);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || null,
        bannerUrl: form.bannerUrl || null,
        thumbnailUrl: form.thumbnailUrl || null,
        gameId: form.gameId,
        organizationId: form.organizationId || null,
        format: form.format,
        participationType: form.participationType,
        teamSize: form.teamSize,
        minParticipants: form.minParticipants || 2,
        maxParticipants: form.maxParticipants || 16,
        registrationStart: new Date(form.registrationStart).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        timezone: form.timezone || 'UTC',
        locationMode: form.locationMode || 'ONLINE',
        rules: form.rules || null,
        prizePool: form.prizePool || null,
        visibility: form.visibility || 'PUBLIC',
        formatConfig: {
          matchEngine: form.matchEngine,
          gameMode: form.gameMode,
          teamsPerLobby: form.teamsPerLobby,
          matchesPerGroup: form.matchesPerGroup,
          maps: form.selectedMaps,
          scoringRuleset: {
            placementPoints: activeMode?.placementPoints || { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0 },
            eliminationPointValue: form.eliminationPoints || 1,
            tieBreakers: ['MOST_WINS', 'TOTAL_ELIMINATIONS', 'LAST_MATCH_PLACEMENT'],
          },
          seriesConfig: {
            format: form.seriesFormat,
            mapsCount: form.seriesFormat === 'BO1' ? 1 : form.seriesFormat === 'BO5' ? 5 : 3,
          },
        },
      };

      const created = await evoqService.createTournament(payload);

      if (isPublish) {
        await evoqService.updateTournamentStatus(created.id, 'PUBLISHED');
      }

      navigate(`/organizer/tournaments/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to create tournament.');
    } finally {
      setSubmitting(false);
    }
  };

  const activePreset = GAME_PRESETS[form.gameSlug] || GAME_PRESETS['free-fire'];
  const activeModes = activePreset?.modes || [];
  const currentMode = activeModes.find((m) => m.id === form.gameMode) || activeModes[0];

  const stepsList = [
    'Basic Information',
    'Event Type',
    'Game & Mode',
    'Participation',
    'Format Engine',
    'Rules & Scoring',
    'Schedule',
    'Review & Deploy',
  ];

  if (loading) {
    return (
      <OrganizerLayout title="Tournament Creation Wizard">
        <SkeletonLoader type="card" count={3} height="180px" />
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout
      title="Create Tournament"
      actions={
        <Link to="/organizer/tournaments" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
          <Icon name="arrow-left" size={14} />
          <span>Exit Wizard</span>
        </Link>
      }
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* ── Wizard Step Navigation Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            backgroundColor: 'var(--evoq-surface)',
            border: '1px solid var(--evoq-border)',
            borderRadius: 'var(--evoq-radius-sm)',
            padding: '12px 16px',
            overflowX: 'auto',
            gap: '8px',
          }}
        >
          {stepsList.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;

            return (
              <div
                key={title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  opacity: isCurrent ? 1 : isCompleted ? 0.8 : 0.4,
                  color: isCurrent ? 'var(--evoq-lime)' : 'inherit',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--evoq-font-mono)',
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--evoq-lime)' : isCompleted ? 'rgba(201, 255, 82, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: isCurrent ? '#000' : isCompleted ? 'var(--evoq-lime)' : 'inherit',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span>{title}</span>
                {idx < stepsList.length - 1 && <span style={{ opacity: 0.3, margin: '0 4px' }}>›</span>}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="evoq-alert evoq-alert-danger" role="alert" style={{ marginBottom: '20px' }}>
            <Icon name="x" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Wizard Body Card ── */}
        <div className="evoq-card" style={{ padding: '24px' }}>
          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div>
              <SectionHeader
                title="Step 1: Tournament Identity & Overview"
                subtitle="Public tournament name, web handle, rules, and host organization"
              />

              <Input
                label="Tournament Event Name"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Free Fire Masters Series: Season 1"
                required
              />

              <Input
                label="Slug Identifier (URL Path)"
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="e.g. ff-masters-s1"
                required
                helperText="Permanent public URL: /tournaments/[slug]"
              />

              <Textarea
                label="Tournament Description"
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event, format overview, qualifications, and live stream broadcasts..."
                rows={3}
              />

              {organizations.length > 0 && (
                <Select
                  label="Host Organization (Optional)"
                  id="organizationId"
                  name="organizationId"
                  value={form.organizationId}
                  onChange={handleChange}
                >
                  <option value="">Personal Independent Organizer</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Select>
              )}

              <Select
                label="Public Visibility"
                id="visibility"
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
              >
                <option value="PUBLIC">Public (Featured in Arena & Search)</option>
                <option value="UNLISTED">Unlisted (Accessible via Direct Link)</option>
                <option value="PRIVATE">Private (Invite Only)</option>
              </Select>

              <div style={{ marginTop: '16px' }}>
                <Input
                  label="Banner Image URL"
                  id="bannerUrl"
                  name="bannerUrl"
                  value={form.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                  helperText="Header artwork for event hero card (1920x400 recommended)."
                />
                <label className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '-4px' }}>
                  <Icon name="plus" size={13} />
                  <span>Upload Banner From Disk</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: EVENT TYPE */}
          {step === 2 && (
            <div>
              <SectionHeader
                title="Step 2: Event Delivery Architecture"
                subtitle="Select whether this event is executed Online or as a Local Offline LAN"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div
                  onClick={() => setForm((p) => ({ ...p, locationMode: 'ONLINE' }))}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: form.locationMode === 'ONLINE' ? '2px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                    backgroundColor: form.locationMode === 'ONLINE' ? 'rgba(201, 255, 82, 0.05)' : 'var(--evoq-surface-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="gamepad" size={20} color="var(--evoq-lime)" />
                      <strong style={{ fontSize: '1.1rem', color: 'var(--evoq-text-primary)' }}>Online Tournament</strong>
                    </div>
                    <Badge variant="lime">PRODUCTION READY</Badge>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--evoq-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    Automated online room credentials, remote check-in, cloud leaderboards, and referee result approval.
                  </p>
                </div>

                <div
                  onClick={() => setForm((p) => ({ ...p, locationMode: 'LAN' }))}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: form.locationMode === 'LAN' ? '2px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                    backgroundColor: form.locationMode === 'LAN' ? 'rgba(201, 255, 82, 0.05)' : 'var(--evoq-surface-elevated)',
                    cursor: 'pointer',
                    opacity: 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="home" size={20} />
                      <strong style={{ fontSize: '1.1rem', color: 'var(--evoq-text-primary)' }}>Offline / LAN Arena</strong>
                    </div>
                    <Badge variant="neutral">LAN SIDECAR V2</Badge>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--evoq-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    On-premise tournament staging, venue check-in terminals, and local match server integration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GAME AND MODE */}
          {step === 3 && (
            <div>
              <SectionHeader
                title="Step 3: Select Esports Title & Game Mode"
                subtitle="Loads verified competitive presets, tournament mechanics, and scoring tables"
              />

              <Select
                label="Competitive Game Title"
                id="gameId"
                name="gameId"
                value={form.gameId}
                onChange={handleGameChange}
                required
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>

              <div style={{ marginTop: '16px' }}>
                <span className="evoq-mono-label" style={{ marginBottom: '8px', display: 'block' }}>
                  GAME MODE FOR {activePreset?.name?.toUpperCase()}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {activeModes.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleModeChange({ target: { value: m.id } })}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--evoq-radius-sm)',
                        border: form.gameMode === m.id ? '2px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                        backgroundColor: form.gameMode === m.id ? 'rgba(201, 255, 82, 0.05)' : 'var(--evoq-surface-elevated)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ color: 'var(--evoq-text-primary)', fontSize: '0.98rem' }}>{m.name}</strong>
                        <Badge variant={m.matchEngine === 'BATTLE_ROYALE' ? 'lime' : 'neutral'} size="sm">
                          {m.matchEngine === 'BATTLE_ROYALE' ? 'BATTLE ROYALE' : 'HEAD TO HEAD'}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)', marginTop: '6px' }}>
                        Default format: {m.defaultFormat.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PARTICIPATION CONFIGURATION */}
          {step === 4 && (
            <div>
              <SectionHeader
                title="Step 4: Participation & Roster Policies"
                subtitle="Individual or squad entries, roster sizing, and bracket capacity"
              />

              <Select
                label="Entry Type"
                id="participationType"
                name="participationType"
                value={form.participationType}
                onChange={handleChange}
              >
                <option value="TEAM">Competitive Team / Squad Entry</option>
                <option value="INDIVIDUAL">Solo Individual Competitor Entry</option>
              </Select>

              {form.participationType === 'TEAM' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <Input
                    label="Active Lineup Size"
                    type="number"
                    id="teamSize"
                    name="teamSize"
                    value={form.teamSize}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    required
                    helperText="Number of starters competing in match room."
                  />

                  <Input
                    label="Maximum Roster Size"
                    type="number"
                    id="maxRosterSize"
                    name="maxRosterSize"
                    value={form.teamSize + 2}
                    disabled
                    helperText="Includes up to 2 reserve substitutes."
                  />
                </div>
              )}

              <Input
                label="Maximum Total Entrants (Capacity)"
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                min={2}
                max={256}
                required
                helperText={`Maximum ${form.participationType === 'TEAM' ? 'teams' : 'players'} accepted into tournament.`}
              />
            </div>
          )}

          {/* STEP 5: COMPETITION FORMAT */}
          {step === 5 && (
            <div>
              <SectionHeader
                title="Step 5: Competition Format & Match Engine"
                subtitle="Elimination brackets, round robin, or multi-lobby group stages"
              />

              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="evoq-mono-label">ACTIVE ENGINE:</span>
                <Badge variant="lime">{form.matchEngine}</Badge>
              </div>

              {form.matchEngine === 'BATTLE_ROYALE' ? (
                <Select
                  label="Battle Royale Tournament Format"
                  id="format"
                  name="format"
                  value={form.format}
                  onChange={handleChange}
                >
                  <option value="GROUP_STAGE_FINALS">Group Stage Qualifiers + Grand Finals</option>
                  <option value="POINTS_TABLE">League Points Table (Cumulative Standings)</option>
                  <option value="GROUP_STAGE">Single Group / Single Lobby Stage</option>
                  <option value="CUSTOM">Custom Battle Royale Format</option>
                </Select>
              ) : (
                <Select
                  label="Head-to-Head Tournament Format"
                  id="format"
                  name="format"
                  value={form.format}
                  onChange={handleChange}
                >
                  <option value="DOUBLE_ELIMINATION">Double Elimination (Upper & Lower Brackets + Grand Finals)</option>
                  <option value="SINGLE_ELIMINATION">Single Elimination (Knockout)</option>
                  <option value="SWISS">Swiss System (Record-Based Pairings)</option>
                  <option value="ROUND_ROBIN">Round Robin (All-Play-All)</option>
                  <option value="CUSTOM">Custom Head-to-Head Format</option>
                </Select>
              )}
            </div>
          )}

          {/* STEP 6: RULES & SCORING */}
          {step === 6 && (
            <div>
              <SectionHeader
                title="Step 6: Game-Specific Rules, Scoring & Maps"
                subtitle="Preloaded with official game publisher rulesets"
              />

              {form.matchEngine === 'BATTLE_ROYALE' ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <Input
                      label="Teams Per Match Lobby"
                      type="number"
                      id="teamsPerLobby"
                      name="teamsPerLobby"
                      value={form.teamsPerLobby}
                      onChange={handleChange}
                      min={4}
                      max={25}
                      required
                      helperText="Standard Free Fire: 12, BGMI: 16."
                    />

                    <Input
                      label="Matches Per Stage"
                      type="number"
                      id="matchesPerGroup"
                      name="matchesPerGroup"
                      value={form.matchesPerGroup}
                      onChange={handleChange}
                      min={1}
                      max={12}
                      required
                      helperText="Matches played per group/lobby."
                    />

                    <Input
                      label="Points Per Elimination"
                      type="number"
                      id="eliminationPoints"
                      name="eliminationPoints"
                      value={form.eliminationPoints}
                      onChange={handleChange}
                      min={0}
                      max={10}
                      required
                      helperText="Awarded for each confirmed finish/kill."
                    />
                  </div>

                  <div style={{ marginTop: '16px', padding: '14px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="evoq-mono-label">PLACEMENT POINTS TABLE (OFFICIAL PRESET)</span>
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{ background: 'none', border: 'none', color: 'var(--evoq-lime)', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {showAdvanced ? 'Hide Table' : 'View Point System'}
                      </button>
                    </div>

                    {showAdvanced && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '12px' }}>
                        {Object.entries(currentMode?.placementPoints || {}).map(([place, pts]) => (
                          <div key={place} style={{ padding: '6px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--evoq-text-muted)' }}>#{place}</div>
                            <strong style={{ color: 'var(--evoq-lime)' }}>{pts} pts</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <Select
                    label="Match Series Format"
                    id="seriesFormat"
                    name="seriesFormat"
                    value={form.seriesFormat}
                    onChange={handleChange}
                  >
                    <option value="BO1">Best of 1 (Single Map)</option>
                    <option value="BO3">Best of 3 (First to 2 Map Wins)</option>
                    <option value="BO5">Best of 5 (First to 3 Map Wins)</option>
                  </Select>

                  <div style={{ marginTop: '12px' }}>
                    <span className="evoq-mono-label">OFFICIAL MAP ROTATION POOL</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {currentMode?.defaultMaps?.map((map) => (
                        <Badge key={map} variant="neutral">
                          {map}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: REGISTRATION & SCHEDULE */}
          {step === 7 && (
            <div>
              <SectionHeader
                title="Step 7: Schedule, Registration Windows & Prize"
                subtitle="Dates must be chronological: Registration Start → Deadline → Tournament Start"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <Input
                  label="Registration Opens"
                  type="datetime-local"
                  id="registrationStart"
                  name="registrationStart"
                  value={form.registrationStart}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Registration Deadline"
                  type="datetime-local"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  value={form.registrationDeadline}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Tournament Start Date"
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Tournament End Date (Optional)"
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <Input
                  label="Total Prize Purse / Awards"
                  id="prizePool"
                  name="prizePool"
                  value={form.prizePool}
                  onChange={handleChange}
                  placeholder="e.g. $1,500 USD or 25,000 INR"
                />

                <Select
                  label="Tournament Timezone"
                  id="timezone"
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="Asia/Kolkata">IST (Asia / Kolkata)</option>
                  <option value="America/New_York">EST (America / New York)</option>
                  <option value="Europe/London">GMT / BST (Europe / London)</option>
                </Select>
              </div>

              <Textarea
                label="Player Rules & Code of Conduct (Optional)"
                id="rules"
                name="rules"
                value={form.rules}
                onChange={handleChange}
                rows={3}
                placeholder="Fair play guidelines, disconnect policy, lobby check-in requirements..."
              />
            </div>
          )}

          {/* STEP 8: REVIEW & PUBLISH */}
          {step === 8 && (
            <div>
              <SectionHeader
                title="Step 8: Review & Deploy Tournament"
                subtitle="Confirm configuration before publishing to the EVOQ arena"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid var(--evoq-border)' }}>
                  <span className="evoq-mono-label">EVENT TITLE</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', marginTop: '4px' }}>{form.name}</div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--evoq-lime)' }}>/{form.slug}</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid var(--evoq-border)' }}>
                  <span className="evoq-mono-label">ESPORTS TITLE & MODE</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', marginTop: '4px' }}>{activePreset.name}</div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>{currentMode.name}</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid var(--evoq-border)' }}>
                  <span className="evoq-mono-label">COMPETITION ENGINE</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-lime)', marginTop: '4px' }}>{form.matchEngine}</div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>{form.format.replace(/_/g, ' ')}</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid var(--evoq-border)' }}>
                  <span className="evoq-mono-label">CAPACITY</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', marginTop: '4px' }}>
                    {form.maxParticipants} {form.participationType === 'TEAM' ? 'Teams' : 'Players'}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>Lineup: {form.teamSize}</span>
                </div>
              </div>

              {/* Validation Checklist */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(201, 255, 82, 0.04)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid rgba(201, 255, 82, 0.2)', marginBottom: '20px' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--evoq-lime)' }}>PRE-DEPLOYMENT VALIDATION CHECKLIST</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Event Title and custom slug are unique and valid</li>
                  <li>Title compatibility matches {activePreset.name} competitive requirements</li>
                  <li>Schedule is chronologically synchronized across timezone {form.timezone}</li>
                  <li>Competition ruleset and lobby structures are initialized</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Wizard Navigation Controls Bar ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--evoq-border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            {step > 1 ? (
              <SecondaryButton onClick={handlePrev} icon="arrow-left">
                Previous Step
              </SecondaryButton>
            ) : (
              <div />
            )}

            {step < 8 ? (
              <PrimaryButton onClick={handleNext} icon="arrow-right">
                Continue to Step {step + 1}
              </PrimaryButton>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <SecondaryButton
                  onClick={() => handleSave(false)}
                  disabled={submitting}
                  loading={submitting}
                >
                  Save Draft
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => handleSave(true)}
                  disabled={submitting}
                  loading={submitting}
                  icon="check"
                  size="md"
                >
                  {submitting ? 'Publishing Event...' : 'Publish Tournament'}
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
