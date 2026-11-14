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

/**
 * Verified Official Publisher Scoring Presets
 */
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
        defaultFormat: 'GROUP_STAGE_FINALS',
        placementPoints: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0 },
        eliminationPoints: 1,
      },
      {
        id: 'clash-squad',
        name: 'Clash Squad (4v4)',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 4,
        defaultFormat: 'SINGLE_ELIMINATION',
        placementPoints: { 1: 10, 2: 6, 3: 4, 4: 2 },
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
        defaultFormat: 'GROUP_STAGE_FINALS',
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
        defaultFormat: 'DOUBLE_ELIMINATION',
        placementPoints: { 1: 10, 2: 6, 3: 4, 4: 2 },
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
        defaultFormat: 'DOUBLE_ELIMINATION',
        placementPoints: { 1: 10, 2: 6, 3: 4, 4: 2 },
      },
    ],
  },
  'call-of-duty': {
    name: 'Call of Duty: Mobile',
    modes: [
      {
        id: 'multiplayer-5v5',
        name: 'Multiplayer (5v5)',
        matchEngine: 'HEAD_TO_HEAD',
        defaultTeamSize: 5,
        defaultFormat: 'SINGLE_ELIMINATION',
        placementPoints: { 1: 10, 2: 6, 3: 4, 4: 2 },
      },
      {
        id: 'battle-royale',
        name: 'Battle Royale (Squad)',
        matchEngine: 'BATTLE_ROYALE',
        defaultTeamSize: 4,
        teamsPerLobby: 16,
        defaultFormat: 'POINTS_TABLE',
        placementPoints: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 0, 10: 0 },
        eliminationPoints: 1,
      },
    ],
  },
};

/**
 * Helper to convert integer placement to ordinal string (1 -> 1st, 2 -> 2nd, etc.)
 */
function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Convert placement points object { 1: 12, 2: 9 } to ordered table rows array
 */
function presetToRows(pointsObj = {}) {
  const entries = Object.entries(pointsObj)
    .map(([pl, pts]) => ({ placement: parseInt(pl, 10), points: Number(pts) }))
    .filter((r) => !isNaN(r.placement) && !isNaN(r.points));
  entries.sort((a, b) => a.placement - b.placement);
  return entries;
}

export default function OrganizerTournamentWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [games, setGames] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Basic Information
    name: '',
    slug: '',
    description: '',
    bannerUrl: '',
    thumbnailUrl: '',
    organizationId: '',
    visibility: 'PUBLIC',

    // Step 2: Event Type
    locationMode: 'ONLINE', // ONLINE or LAN

    // Step 3: Game & Mode
    gameId: '',
    gameSlug: '',
    gameMode: 'battle-royale',

    // Step 4: Rules & Scoring — Placement Points Table
    placementPointsTable: [],

    // Step 5: Schedule
    registrationStart: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    prizePool: '',
    rules: '',
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
    const initialRows = presetToRows(mode.placementPoints || { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6 });

    setForm((prev) => ({
      ...prev,
      gameId,
      gameSlug: slug,
      gameMode: mode.id,
      placementPointsTable: initialRows,
    }));
  };

  const handleGameChange = (e) => {
    const gameId = e.target.value;
    const gameObj = games.find((g) => g.id === gameId);
    applyGameDefaults(gameId, gameObj?.slug);
  };

  const handleModeChange = (modeId) => {
    const preset = GAME_PRESETS[form.gameSlug] || GAME_PRESETS['free-fire'];
    const mode = preset.modes.find((m) => m.id === modeId) || preset.modes[0];
    const initialRows = presetToRows(mode.placementPoints || { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6 });

    setForm((prev) => ({
      ...prev,
      gameMode: mode.id,
      placementPointsTable: initialRows,
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

  // ── Placement Points Table Handlers ──
  const handlePlacementRowChange = (index, field, value) => {
    setSavedFeedback(false);
    setForm((prev) => {
      const nextTable = [...prev.placementPointsTable];
      const parsed = value === '' ? '' : Number(value);
      nextTable[index] = {
        ...nextTable[index],
        [field]: parsed,
      };
      return { ...prev, placementPointsTable: nextTable };
    });
  };

  const handleAddPlacementRow = () => {
    setSavedFeedback(false);
    setForm((prev) => {
      const nextTable = [...prev.placementPointsTable];
      const maxPlacement = nextTable.reduce((max, r) => {
        const val = Number(r.placement);
        return !isNaN(val) && val > max ? val : max;
      }, 0);
      nextTable.push({
        placement: maxPlacement + 1,
        points: 0,
      });
      return { ...prev, placementPointsTable: nextTable };
    });
  };

  const handleRemovePlacementRow = (index) => {
    setSavedFeedback(false);
    setForm((prev) => {
      if (prev.placementPointsTable.length <= 1) {
        setError('Tournament must configure at least one placement rank.');
        return prev;
      }
      const nextTable = prev.placementPointsTable.filter((_, i) => i !== index);
      return { ...prev, placementPointsTable: nextTable };
    });
  };

  const handleResetToDefaultPreset = () => {
    const preset = GAME_PRESETS[form.gameSlug] || GAME_PRESETS['free-fire'];
    const mode = preset.modes.find((m) => m.id === form.gameMode) || preset.modes[0];
    const defaultRows = presetToRows(mode.placementPoints || { 1: 12, 2: 9, 3: 8 });
    setForm((prev) => ({
      ...prev,
      placementPointsTable: defaultRows,
    }));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleSavePlacementConfiguration = () => {
    setError('');
    // Validation: Check rows
    const rows = form.placementPointsTable;
    if (!rows || rows.length === 0) {
      setError('At least one placement row is required.');
      return false;
    }

    const seenPlacements = new Set();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.placement === '' || isNaN(r.placement) || r.placement < 1 || !Number.isInteger(Number(r.placement))) {
        setError(`Row #${i + 1}: Placement must be a valid positive integer (e.g. 1, 2, 3...).`);
        return false;
      }
      if (r.points === '' || isNaN(r.points) || r.points < 0) {
        setError(`Row #${i + 1}: Points must be a valid non-negative number.`);
        return false;
      }
      if (seenPlacements.has(r.placement)) {
        setError(`Duplicate placement "${getOrdinal(r.placement)}" detected. Each placement rank must be unique.`);
        return false;
      }
      seenPlacements.add(r.placement);
    }

    // Sort deterministically by placement ascending
    const sorted = [...rows].sort((a, b) => Number(a.placement) - Number(b.placement));
    setForm((prev) => ({ ...prev, placementPointsTable: sorted }));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3500);
    return true;
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
      if (!handleSavePlacementConfiguration()) {
        return false;
      }
    } else if (s === 5) {
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
    if (!validateStep(5)) return;
    setSubmitting(true);
    setError('');

    try {
      const activePreset = GAME_PRESETS[form.gameSlug] || GAME_PRESETS['free-fire'];
      const activeMode = activePreset?.modes.find((m) => m.id === form.gameMode) || activePreset.modes[0];

      // Convert table to placement points map: { 1: 12, 2: 9, ... }
      const placementPointsMap = {};
      form.placementPointsTable.forEach((row) => {
        placementPointsMap[row.placement] = Number(row.points);
      });

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || null,
        bannerUrl: form.bannerUrl || null,
        thumbnailUrl: form.thumbnailUrl || null,
        gameId: form.gameId,
        organizationId: form.organizationId || null,
        format: activeMode.defaultFormat || 'SINGLE_ELIMINATION',
        participationType: activeMode.matchEngine === 'BATTLE_ROYALE' ? 'TEAM' : 'TEAM',
        teamSize: activeMode.defaultTeamSize || 4,
        minParticipants: 2,
        maxParticipants: activeMode.matchEngine === 'BATTLE_ROYALE' ? 24 : 16,
        registrationStart: new Date(form.registrationStart).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        timezone: 'UTC',
        locationMode: form.locationMode || 'ONLINE',
        rules: form.rules?.trim() || null,
        prizePool: form.prizePool?.trim() || null,
        visibility: form.visibility || 'PUBLIC',
        formatConfig: {
          matchEngine: activeMode.matchEngine,
          gameMode: form.gameMode,
          scoringRuleset: {
            placementPoints: placementPointsMap,
            eliminationPointValue: activeMode.eliminationPoints || 1,
            tieBreakers: ['MOST_WINS', 'TOTAL_ELIMINATIONS', 'LAST_MATCH_PLACEMENT'],
          },
          placementPoints: placementPointsMap,
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

        {savedFeedback && (
          <div className="evoq-alert evoq-alert-success" style={{ marginBottom: '20px' }}>
            <Icon name="check" size={16} />
            <span>Placement Points Configuration Verified &amp; Saved.</span>
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
                      onClick={() => handleModeChange(m.id)}
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
                        Publisher Preset: {Object.keys(m.placementPoints || {}).length} Placement Ranks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: RULES & SCORING — PLACEMENT POINTS CONFIGURATION ONLY */}
          {step === 4 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <SectionHeader
                  title="Step 4: Rules & Scoring — Placement Points Configuration"
                  subtitle="Configure official points awarded per final match placement rank"
                />
                <Badge variant="lime">
                  {activePreset.name.toUpperCase()} • {currentMode.name.toUpperCase()}
                </Badge>
              </div>

              {/* Placement Points Table Card */}
              <div
                style={{
                  backgroundColor: 'var(--evoq-surface-elevated)',
                  border: '1px solid var(--evoq-border)',
                  borderRadius: 'var(--evoq-radius-sm)',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--evoq-text-primary)' }}>
                      Placement Points Table
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--evoq-text-secondary)' }}>
                      Verified official preset loaded. Adjust individual points or add custom ranks below.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleResetToDefaultPreset}
                      className="evoq-btn evoq-btn-secondary evoq-btn-xs"
                      title="Reset points back to official publisher default"
                    >
                      Reset Default Preset
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPlacementRow}
                      className="evoq-btn evoq-btn-primary evoq-btn-xs"
                    >
                      <Icon name="plus" size={12} />
                      <span>Add Placement</span>
                    </button>
                  </div>
                </div>

                {/* Editable Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--evoq-border)', color: 'var(--evoq-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '10px 12px', width: '180px' }}>Placement Rank</th>
                        <th style={{ padding: '10px 12px' }}>Points Awarded</th>
                        <th style={{ padding: '10px 12px', width: '90px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.placementPointsTable.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Badge variant="lime" size="sm" style={{ minWidth: '40px', justifyContent: 'center' }}>
                                {getOrdinal(row.placement || idx + 1)}
                              </Badge>
                              <input
                                type="number"
                                min={1}
                                value={row.placement}
                                onChange={(e) => handlePlacementRowChange(idx, 'placement', e.target.value)}
                                style={{
                                  width: '70px',
                                  padding: '6px 8px',
                                  backgroundColor: 'var(--evoq-surface)',
                                  border: '1px solid var(--evoq-border)',
                                  borderRadius: '4px',
                                  color: 'var(--evoq-text-primary)',
                                  fontFamily: 'var(--evoq-font-mono)',
                                  fontSize: '0.88rem',
                                  outline: 'none',
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="number"
                                min={0}
                                value={row.points}
                                onChange={(e) => handlePlacementRowChange(idx, 'points', e.target.value)}
                                style={{
                                  width: '100px',
                                  padding: '6px 10px',
                                  backgroundColor: 'var(--evoq-surface)',
                                  border: '1px solid var(--evoq-border)',
                                  borderRadius: '4px',
                                  color: 'var(--evoq-lime)',
                                  fontWeight: 700,
                                  fontFamily: 'var(--evoq-font-mono)',
                                  fontSize: '0.92rem',
                                  outline: 'none',
                                }}
                              />
                              <span style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)' }}>pts</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleRemovePlacementRow(idx)}
                              disabled={form.placementPointsTable.length <= 1}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--evoq-border)',
                                color: form.placementPointsTable.length <= 1 ? 'var(--evoq-text-muted)' : '#ff6b6b',
                                cursor: form.placementPointsTable.length <= 1 ? 'not-allowed' : 'pointer',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                fontSize: '0.78rem',
                                transition: 'all 0.15s ease',
                              }}
                              title="Remove placement row"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--evoq-border)', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleAddPlacementRow}
                    className="evoq-btn evoq-btn-secondary evoq-btn-sm"
                  >
                    <Icon name="plus" size={13} />
                    <span>Add Placement Rank</span>
                  </button>

                  <PrimaryButton
                    type="button"
                    onClick={handleSavePlacementConfiguration}
                    size="sm"
                    icon="check"
                  >
                    Save Configuration
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REGISTRATION & SCHEDULE */}
          {step === 5 && (
            <div>
              <SectionHeader
                title="Step 5: Schedule, Registration Windows & Prize"
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

              <div style={{ marginTop: '16px' }}>
                <Input
                  label="Total Prize Purse / Awards (Optional)"
                  id="prizePool"
                  name="prizePool"
                  value={form.prizePool}
                  onChange={handleChange}
                  placeholder="e.g. $1,500 USD or 25,000 INR"
                />
              </div>

              <div style={{ marginTop: '16px' }}>
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
            </div>
          )}

          {/* STEP 6: REVIEW & PUBLISH */}
          {step === 6 && (
            <div>
              <SectionHeader
                title="Step 6: Review & Deploy Tournament"
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
                  <span className="evoq-mono-label">DELIVERY MODE</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-lime)', marginTop: '4px' }}>{form.locationMode}</div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>{form.visibility}</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid var(--evoq-border)' }}>
                  <span className="evoq-mono-label">SCORING RANKS</span>
                  <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', marginTop: '4px' }}>
                    {form.placementPointsTable.length} Ranks Configured
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--evoq-lime)' }}>
                    1st: {form.placementPointsTable.find((r) => r.placement === 1)?.points ?? 0} pts
                  </span>
                </div>
              </div>

              {/* Placement Points Summary */}
              <div style={{ padding: '14px 16px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid var(--evoq-border)', marginBottom: '20px' }}>
                <span className="evoq-mono-label" style={{ display: 'block', marginBottom: '8px' }}>
                  PLACEMENT POINTS BREAKDOWN
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.placementPointsTable.map((row) => (
                    <div
                      key={row.placement}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--evoq-surface)',
                        border: '1px solid var(--evoq-border)',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--evoq-font-mono)',
                      }}
                    >
                      <span style={{ color: 'var(--evoq-text-muted)' }}>{getOrdinal(row.placement)}: </span>
                      <strong style={{ color: 'var(--evoq-lime)' }}>{row.points} pts</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Checklist */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(201, 255, 82, 0.04)', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid rgba(201, 255, 82, 0.2)', marginBottom: '20px' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--evoq-lime)' }}>PRE-DEPLOYMENT VALIDATION CHECKLIST</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Event Title and custom slug are unique and valid</li>
                  <li>Title compatibility matches {activePreset.name} competitive requirements</li>
                  <li>Placement scoring points are validated with deterministic rank order</li>
                  <li>Registration opening, deadline, and event start dates are verified</li>
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

            {step < 6 ? (
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
