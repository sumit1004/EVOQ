import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function TournamentWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [games, setGames] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    gameId: '',
    organizationId: '',
    bannerUrl: '',
    description: '',
    format: 'SINGLE_ELIMINATION',
    participationType: 'INDIVIDUAL',
    teamSize: 5,
    minParticipants: 4,
    maxParticipants: 16,
    registrationOpensAt: '',
    registrationClosesAt: '',
    startsAt: '',
    endsAt: '',
    rules: '',
    prizePool: '',
    currency: 'USD',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [gamesData, orgsData] = await Promise.all([
          evoqService.getGames(),
          evoqService.getMyOrganizations().catch(() => []),
        ]);
        setGames(gamesData || []);
        if (gamesData && gamesData.length > 0) {
          setForm((prev) => ({ ...prev, gameId: gamesData[0].id }));
        }
        setOrganizations(orgsData || []);
      } catch (err) {
        console.error('Error loading wizard metadata:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? (value ? Number(value) : '') : value,
      };

      if (name === 'title' && !prev.slug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      return updated;
    });
  }

  function validateStep(s) {
    setError('');
    if (s === 1) {
      if (!form.title.trim()) {
        setError('Tournament title is required.');
        return false;
      }
      if (!form.slug.trim()) {
        setError('Slug is required.');
        return false;
      }
      if (!form.gameId) {
        setError('Please select a game.');
        return false;
      }
    } else if (s === 2) {
      if (!form.maxParticipants || form.maxParticipants < 2) {
        setError('Max participants must be at least 2.');
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  }

  function prevStep() {
    setError('');
    setStep((prev) => prev - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(step)) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        prizePool: form.prizePool ? Number(form.prizePool) : 0,
        teamSize: form.participationType === 'TEAM' ? Number(form.teamSize) : null,
        organizationId: form.organizationId || null,
        registrationOpensAt: form.registrationOpensAt ? new Date(form.registrationOpensAt).toISOString() : null,
        registrationClosesAt: form.registrationClosesAt ? new Date(form.registrationClosesAt).toISOString() : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };

      const created = await evoqService.createTournament(payload);
      navigate(`/dashboard/tournaments/${created.id}/manage`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create tournament.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="platform-page" style={{ maxWidth: '840px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Tournament Creation Wizard</h1>
            <p className="page-subtitle">Configure format, rules, and roster constraints for your competitive event.</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
          {[
            { num: 1, label: '1. Basic Info' },
            { num: 2, label: '2. Format & Capacity' },
            { num: 3, label: '3. Rules & Schedule' },
            { num: 4, label: '4. Review & Deploy' },
          ].map((item) => (
            <div
              key={item.num}
              style={{
                flex: 1,
                padding: 'var(--space-sm)',
                textAlign: 'center',
                borderBottom: step === item.num ? '3px solid var(--primary)' : '3px solid var(--border)',
                fontWeight: step === item.num ? '700' : '500',
                color: step === item.num ? 'var(--primary)' : 'var(--muted)',
                fontSize: '0.9rem',
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {error && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

        <div className="evoq-card">
          {loading ? (
            <div className="empty-state">Loading tournament builder...</div>
          ) : (
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
                    Basic Tournament Information
                  </h2>
                  <div className="form-group">
                    <label>Tournament Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. EVOQ Masters: Valorant Winter Cup"
                      className="evoq-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      required
                      placeholder="evoq-masters-valorant-winter-cup"
                      className="evoq-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Game Title *</label>
                    <select
                      name="gameId"
                      value={form.gameId}
                      onChange={handleChange}
                      required
                      className="evoq-input"
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.genre})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hosting Organization (Optional)</label>
                    <select
                      name="organizationId"
                      value={form.organizationId}
                      onChange={handleChange}
                      className="evoq-input"
                    >
                      <option value="">Host as Individual Verified Organizer</option>
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
                  <div className="form-group">
                    <label>Banner Image URL</label>
                    <input
                      type="url"
                      name="bannerUrl"
                      value={form.bannerUrl}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/..."
                      className="evoq-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description & Overview</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Brief overview, broadcast links, sponsor highlights..."
                      className="evoq-textarea"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
                    Competition Format & Participant Capacities
                  </h2>
                  <div className="form-group">
                    <label>Tournament Structure / Bracket Format *</label>
                    <select
                      name="format"
                      value={form.format}
                      onChange={handleChange}
                      className="evoq-input"
                    >
                      <option value="SINGLE_ELIMINATION">Single Elimination (Classic Knockout)</option>
                      <option value="DOUBLE_ELIMINATION">Double Elimination (Winners & Losers Bracket)</option>
                      <option value="ROUND_ROBIN">Round Robin (All-play-all groups)</option>
                      <option value="BATTLE_ROYALE">Battle Royale (Multi-team lobbies / Points based)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Participation Type *</label>
                    <select
                      name="participationType"
                      value={form.participationType}
                      onChange={handleChange}
                      className="evoq-input"
                    >
                      <option value="INDIVIDUAL">Individual (1v1 or Solo)</option>
                      <option value="TEAM">Team (Squads / Rosters)</option>
                    </select>
                  </div>

                  {form.participationType === 'TEAM' && (
                    <div className="form-group">
                      <label>Team Roster Size (Starting Players)</label>
                      <input
                        type="number"
                        name="teamSize"
                        min="2"
                        max="10"
                        value={form.teamSize}
                        onChange={handleChange}
                        className="evoq-input"
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                      <label>Min Participants</label>
                      <input
                        type="number"
                        name="minParticipants"
                        min="2"
                        value={form.minParticipants}
                        onChange={handleChange}
                        className="evoq-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Participants *</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        min="2"
                        max="256"
                        value={form.maxParticipants}
                        onChange={handleChange}
                        required
                        className="evoq-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
                    Schedule, Rules & Prizes
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                      <label>Registration Closes</label>
                      <input
                        type="datetime-local"
                        name="registrationClosesAt"
                        value={form.registrationClosesAt}
                        onChange={handleChange}
                        className="evoq-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tournament Starts</label>
                      <input
                        type="datetime-local"
                        name="startsAt"
                        value={form.startsAt}
                        onChange={handleChange}
                        className="evoq-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                      <label>Prize Pool</label>
                      <input
                        type="number"
                        name="prizePool"
                        placeholder="e.g. 5000"
                        value={form.prizePool}
                        onChange={handleChange}
                        className="evoq-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <input
                        type="text"
                        name="currency"
                        value={form.currency}
                        onChange={handleChange}
                        placeholder="USD"
                        className="evoq-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Rulebook & Competition Conduct</label>
                    <textarea
                      name="rules"
                      value={form.rules}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Specify map pool, match format (BO1, BO3), pause rules, tiebreaker criteria, and anti-cheat policies..."
                      className="evoq-textarea"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
                    Review Tournament Specification
                  </h2>
                  <div
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-sm)',
                      fontSize: '0.95rem',
                      marginBottom: 'var(--space-lg)',
                    }}
                  >
                    <div><strong>Title:</strong> {form.title}</div>
                    <div><strong>Slug:</strong> /tournaments/{form.slug}</div>
                    <div><strong>Game:</strong> {games.find((g) => g.id === form.gameId)?.name || 'Selected Game'}</div>
                    <div><strong>Format:</strong> {form.format.replace(/_/g, ' ')}</div>
                    <div><strong>Type:</strong> {form.participationType} {form.participationType === 'TEAM' ? `(Team Size: ${form.teamSize})` : ''}</div>
                    <div><strong>Capacity:</strong> {form.minParticipants} – {form.maxParticipants} Competitors</div>
                    {form.prizePool && <div><strong>Prize Pool:</strong> {form.prizePool} {form.currency}</div>}
                    {form.startsAt && <div><strong>Starts:</strong> {new Date(form.startsAt).toLocaleString()}</div>}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
                {step > 1 ? (
                  <button type="button" className="evoq-btn evoq-btn-secondary" onClick={prevStep}>
                    ← Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button type="button" className="evoq-btn evoq-btn-primary" onClick={nextStep}>
                    Continue →
                  </button>
                ) : (
                  <button type="submit" className="evoq-btn evoq-btn-primary" disabled={submitting}>
                    {submitting ? 'Creating Tournament...' : 'Create Tournament'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

