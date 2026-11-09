import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OrganizerNavbar from '../../components/OrganizerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function OrganizerTournamentWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [games, setGames] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 9-Step Comprehensive Form
  const [form, setForm] = useState({
    // Step 1: Basic
    name: '',
    slug: '',
    description: '',
    // Step 2: Game
    gameId: '',
    organizationId: '',
    // Step 3: Registration
    participationType: 'TEAM',
    teamSize: 5,
    minParticipants: 4,
    maxParticipants: 16,
    // Step 4: Format
    format: 'SINGLE_ELIMINATION',
    // Step 5: Groups & Stages
    groupCount: 2,
    advancePerGroup: 2,
    // Step 6: Schedule
    registrationStart: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    // Step 7: Rules
    rules: '',
    // Step 8: Media & Prizes
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
      if (!form.maxParticipants || form.maxParticipants < 2) {
        setError('Max capacity must be at least 2 competitors.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 9));
    }
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        gameId: form.gameId,
        organizationId: form.organizationId || undefined,
        format: form.format,
        participationType: form.participationType,
        teamSize: form.participationType === 'TEAM' ? Number(form.teamSize) : undefined,
        minParticipants: Number(form.minParticipants) || 2,
        maxParticipants: Number(form.maxParticipants) || 16,
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
      navigate(`/organizer/tournaments/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create tournament.');
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
    <div className="nebula-shell">
      <OrganizerNavbar />
      <main className="nebula-container" style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.4rem' }}>
              TOURNAMENT CREATION ENGINE
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Step {step} of 9: {stepsList[step - 1]}</h1>
          </div>
          <Link to="/organizer/tournaments" className="nebula-btn nebula-btn-secondary nebula-btn-sm">
            Cancel
          </Link>
        </div>

        {/* 9-step progress dots */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
          {stepsList.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;

            return (
              <div
                key={label}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: isCurrent ? 'var(--nebula-cyan)' : isCompleted ? 'var(--nebula-violet)' : 'var(--nebula-border)',
                  transition: 'background-color 0.2s',
                }}
                title={`Step ${stepNum}: ${label}`}
              />
            );
          })}
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        <div className="nebula-card">
          {loading ? (
            <div className="nebula-empty-state">
              <div className="nebula-empty-icon">—</div>
              <p>Loading wizard...</p>
            </div>
          ) : (
            <form onSubmit={step === 9 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* Step 1: Basic */}
              {step === 1 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>1. Basic Tournament Information</h2>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Tournament Title *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. EVOQ Masters: Valorant Invitational"
                      className="nebula-input"
                    />
                  </div>
                  <div className="nebula-form-group">
                    <label className="nebula-label">URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      required
                      placeholder="evoq-masters-valorant-invitational"
                      className="nebula-input"
                    />
                  </div>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Description &amp; Highlights</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Broadcast details, sponsor acknowledgments, map pool..."
                      className="nebula-textarea"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Game */}
              {step === 2 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>2. Game Title &amp; Organization</h2>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Esports Title *</label>
                    <select
                      name="gameId"
                      value={form.gameId}
                      onChange={handleChange}
                      required
                      className="nebula-select"
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.genre})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Hosting Organization (Optional)</label>
                    <select
                      name="organizationId"
                      value={form.organizationId}
                      onChange={handleChange}
                      className="nebula-select"
                    >
                      <option value="">Host as Verified Independent Organizer</option>
                      {organizations.map((item) => {
                        const org = item.organization || item;
                        return (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Registration */}
              {step === 3 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>3. Registration &amp; Capacity Constraints</h2>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Participation Type</label>
                    <select
                      name="participationType"
                      value={form.participationType}
                      onChange={handleChange}
                      className="nebula-select"
                    >
                      <option value="TEAM">Team (Rosters)</option>
                      <option value="SOLO">Solo (1v1 or Individual)</option>
                    </select>
                  </div>

                  {form.participationType === 'TEAM' && (
                    <div className="nebula-form-group">
                      <label className="nebula-label">Roster Size (Starting Players)</label>
                      <input
                        type="number"
                        name="teamSize"
                        min="2"
                        max="10"
                        value={form.teamSize}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Min Participants</label>
                      <input
                        type="number"
                        name="minParticipants"
                        min="2"
                        value={form.minParticipants}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Max Participants *</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        min="2"
                        max="256"
                        value={form.maxParticipants}
                        onChange={handleChange}
                        required
                        className="nebula-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Format */}
              {step === 4 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>4. Competition Bracket Format</h2>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Bracket Type</label>
                    <select
                      name="format"
                      value={form.format}
                      onChange={handleChange}
                      className="nebula-select"
                    >
                      <option value="SINGLE_ELIMINATION">Single Elimination (Knockout Bracket)</option>
                      <option value="DOUBLE_ELIMINATION">Double Elimination (Winners &amp; Losers)</option>
                      <option value="ROUND_ROBIN">Round Robin (All-Play-All)</option>
                      <option value="BATTLE_ROYALE">Battle Royale (Multi-Team Point Lobbies)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 5: Groups & Stages */}
              {step === 5 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>5. Groups &amp; Stage Structure</h2>
                  <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                    Accommodates group stages with up to 12 teams per group, qualification criteria, and playoff bracket seeding.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Number of Groups</label>
                      <input
                        type="number"
                        name="groupCount"
                        min="1"
                        max="8"
                        value={form.groupCount}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Teams Advancing Per Group</label>
                      <input
                        type="number"
                        name="advancePerGroup"
                        min="1"
                        max="4"
                        value={form.advancePerGroup}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Schedule */}
              {step === 6 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>6. Schedule &amp; Match Timing</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Registration Opens</label>
                      <input
                        type="datetime-local"
                        name="registrationStart"
                        value={form.registrationStart}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Registration Deadline</label>
                      <input
                        type="datetime-local"
                        name="registrationDeadline"
                        value={form.registrationDeadline}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Tournament Start Date</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Tournament End Date</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Rules */}
              {step === 7 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>7. Competition Rules &amp; Anti-Cheat</h2>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Rulebook &amp; Code of Conduct</label>
                    <textarea
                      name="rules"
                      value={form.rules}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Map pool, pause allowances, check-in requirements, tiebreak criteria..."
                      className="nebula-textarea"
                    />
                  </div>
                </div>
              )}

              {/* Step 8: Media & Prizes */}
              {step === 8 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>8. Media, Branding &amp; Prizes</h2>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Banner Image URL</label>
                    <input
                      type="url"
                      name="bannerUrl"
                      value={form.bannerUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="nebula-input"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Prize Pool (optional)</label>
                      <input
                        type="number"
                        name="prizePool"
                        value={form.prizePool}
                        onChange={handleChange}
                        placeholder="e.g. 5000"
                        className="nebula-input"
                      />
                    </div>
                    <div className="nebula-form-group">
                      <label className="nebula-label">Currency</label>
                      <input
                        type="text"
                        name="prizeCurrency"
                        value={form.prizeCurrency}
                        onChange={handleChange}
                        className="nebula-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 9: Review */}
              {step === 9 && (
                <div>
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>9. Review &amp; Deploy Event</h2>
                  <div
                    style={{
                      backgroundColor: 'var(--nebula-surface-elevated)',
                      padding: '1.25rem',
                      borderRadius: 'var(--nebula-radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      fontSize: '0.92rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div><strong>Title:</strong> {form.name}</div>
                    <div><strong>Slug:</strong> /tournaments/{form.slug}</div>
                    <div><strong>Game:</strong> {games.find((g) => g.id === form.gameId)?.name || 'Selected Title'}</div>
                    <div><strong>Format:</strong> {form.format.replace(/_/g, ' ')}</div>
                    <div><strong>Type:</strong> {form.participationType} {form.participationType === 'TEAM' ? `(${form.teamSize} players/squad)` : ''}</div>
                    <div><strong>Capacity:</strong> {form.minParticipants} – {form.maxParticipants} Competitors</div>
                    {form.prizePool && <div><strong>Prize Pool:</strong> {form.prizePool} {form.prizeCurrency}</div>}
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid var(--nebula-border)', paddingTop: '1.25rem' }}>
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="nebula-btn nebula-btn-secondary">
                    ← Previous Step
                  </button>
                ) : <div />}

                {step < 9 ? (
                  <button type="button" onClick={nextStep} className="nebula-btn nebula-btn-cyan">
                    Next: {stepsList[step]} →
                  </button>
                ) : (
                  <button type="submit" className="nebula-btn nebula-btn-cyan" disabled={submitting}>
                    {submitting ? 'Deploying Event...' : 'Deploy Tournament Control Room'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

