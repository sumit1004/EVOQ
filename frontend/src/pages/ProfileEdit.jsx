import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import FormInput from '../components/FormInput.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function ProfileEdit() {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Identity Modal state
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [identityForm, setIdentityForm] = useState({
    gameId: '',
    inGameName: '',
    inGameUid: '',
    serverRegion: '',
    competitiveRole: '',
    isPrimary: false,
  });

  const [formData, setFormData] = useState({
    displayName: '',
    slug: '',
    inGameName: '',
    bio: '',
    avatarUrl: '',
    coverUrl: '',
    country: '',
    gamerType: 'COMPETITIVE',
    primaryGameId: '',
    website: '',
    visibility: 'PUBLIC',
    twitter: '',
    discord: '',
    twitch: '',
    youtube: '',
  });

  useEffect(() => {
    Promise.all([evoqService.getMyProfile(), evoqService.getGames()])
      .then(([prof, allGames]) => {
        setGames(allGames || []);
        if (prof) {
          setProfile(prof);
          setFormData({
            displayName: prof.displayName || '',
            slug: prof.slug || '',
            inGameName: prof.inGameName || '',
            bio: prof.bio || '',
            avatarUrl: prof.avatarUrl || '',
            coverUrl: prof.coverUrl || '',
            country: prof.country || '',
            gamerType: prof.gamerType || 'COMPETITIVE',
            primaryGameId: prof.primaryGameId || '',
            website: prof.website || '',
            visibility: prof.visibility || 'PUBLIC',
            twitter: prof.socialLinks?.twitter || '',
            discord: prof.socialLinks?.discord || '',
            twitch: prof.socialLinks?.twitch || '',
            youtube: prof.socialLinks?.youtube || '',
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        displayName: formData.displayName,
        slug: formData.slug,
        inGameName: formData.inGameName || null,
        bio: formData.bio || null,
        avatarUrl: formData.avatarUrl || null,
        coverUrl: formData.coverUrl || null,
        country: formData.country || null,
        gamerType: formData.gamerType,
        primaryGameId: formData.primaryGameId || null,
        website: formData.website || null,
        visibility: formData.visibility,
        socialLinks: {
          twitter: formData.twitter,
          discord: formData.discord,
          twitch: formData.twitch,
          youtube: formData.youtube,
        },
      };

      const updated = await evoqService.updateMyProfile(payload);
      setProfile(updated);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIdentity = async (e) => {
    e.preventDefault();
    try {
      await evoqService.addGameIdentity(identityForm);
      const refreshed = await evoqService.getMyProfile();
      setProfile(refreshed);
      setIdentityModalOpen(false);
      setIdentityForm({
        gameId: '',
        inGameName: '',
        inGameUid: '',
        serverRegion: '',
        competitiveRole: '',
        isPrimary: false,
      });
    } catch (err) {
      alert(err.message || 'Failed to add game identity');
    }
  };

  const handleRemoveIdentity = async (gameId) => {
    if (!window.confirm('Remove this game identity?')) return;
    try {
      await evoqService.removeGameIdentity(gameId);
      const refreshed = await evoqService.getMyProfile();
      setProfile(refreshed);
    } catch (err) {
      alert(err.message || 'Failed to remove game identity');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="platform-page">Loading gamer profile...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="platform-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Gamer Profile</h1>
            <p className="page-subtitle">Manage your competitive identity, game tags, and bio</p>
          </div>
          {profile?.slug && (
            <Link to={`/players/${profile.slug}`} className="btn-secondary">
              View Public Profile
            </Link>
          )}
        </div>

        {message && <div className="auth-alert success">{message}</div>}
        {error && <div className="auth-alert error">{error}</div>}

        {profile && (
          <div className="evoq-card" style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>PROFILE COMPLETENESS</span>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{profile.completeness || 40}% Complete</h3>
            </div>
            <div style={{ flex: 1, maxWidth: '400px', backgroundColor: 'var(--surface-raised)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${profile.completeness || 40}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
            </div>
          </div>
        )}

        <div className="grid-cols-2">
          {/* Main Info Form */}
          <div className="evoq-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-lg)' }}>Profile Details</h2>
            <form onSubmit={handleSaveProfile} className="auth-form">
              <FormInput
                id="displayName"
                label="Display Name / Real Name"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Alex Mercer"
                required
              />

              <FormInput
                id="slug"
                label="Unique Profile URL Slug (/players/your-slug)"
                value={formData.slug}
                onChange={handleChange}
                placeholder="alex-mercer"
                required
              />

              <FormInput
                id="inGameName"
                label="Primary In-Game Handle (IGN)"
                value={formData.inGameName}
                onChange={handleChange}
                placeholder="ShadowStrike"
              />

              <div className="form-group">
                <label className="form-label">Primary Game</label>
                <select
                  name="primaryGameId"
                  value={formData.primaryGameId}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select a game...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Summary</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="form-textarea"
                  placeholder="Competitive FPS player with 4 years tournament experience..."
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
                <FormInput
                  id="avatarUrl"
                  label="Avatar URL"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <FormInput
                  id="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="United States"
                />
              </div>

              <h3 style={{ fontSize: '1rem', marginTop: '1rem', color: 'var(--primary)' }}>Social & Portfolio</h3>
              <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
                <FormInput
                  id="twitter"
                  label="Twitter / X handle"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="@gamer"
                />
                <FormInput
                  id="discord"
                  label="Discord Tag"
                  value={formData.discord}
                  onChange={handleChange}
                  placeholder="gamer#1234"
                />
                <FormInput
                  id="twitch"
                  label="Twitch Channel"
                  value={formData.twitch}
                  onChange={handleChange}
                  placeholder="twitch.tv/..."
                />
                <FormInput
                  id="website"
                  label="Website URL"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Game Identities Panel */}
          <div>
            <div className="evoq-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Game Identities</h2>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIdentityModalOpen(true)}
                >
                  + Add Game Tag
                </button>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                Connect your in-game handles, server regions, and roles for each title you compete in.
              </p>

              {profile?.gameIdentities?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  No game identities linked yet. Add your first game to register for tournaments.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profile?.gameIdentities?.map((gi) => (
                    <div
                      key={gi.id}
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{gi.game?.name}</span>
                          {gi.isPrimary && (
                            <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
                              Primary
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--primary)', marginTop: '2px' }}>
                          IGN: <strong>{gi.inGameName}</strong> {gi.serverRegion && `(${gi.serverRegion})`}
                        </p>
                        {gi.competitiveRole && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Role: {gi.competitiveRole}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveIdentity(gi.gameId)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }}
                        title="Remove identity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Game Identity Modal */}
      {identityModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Link Game Identity</h2>
              <button className="close-btn" onClick={() => setIdentityModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddIdentity} className="auth-form">
              <div className="form-group">
                <label className="form-label">Game *</label>
                <select
                  required
                  value={identityForm.gameId}
                  onChange={(e) => setIdentityForm({ ...identityForm, gameId: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select title...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                id="inGameName"
                label="In-Game Handle / Riot ID / Gamertag *"
                value={identityForm.inGameName}
                onChange={(e) => setIdentityForm({ ...identityForm, inGameName: e.target.value })}
                placeholder="ApexPro#NA1"
                required
              />

              <FormInput
                id="inGameUid"
                label="Account UID / SteamID64 (Optional)"
                value={identityForm.inGameUid}
                onChange={(e) => setIdentityForm({ ...identityForm, inGameUid: e.target.value })}
                placeholder="76561198..."
              />

              <FormInput
                id="serverRegion"
                label="Server / Matchmaking Region"
                value={identityForm.serverRegion}
                onChange={(e) => setIdentityForm({ ...identityForm, serverRegion: e.target.value })}
                placeholder="NA East / EU West"
              />

              <FormInput
                id="competitiveRole"
                label="Preferred Competitive Role"
                value={identityForm.competitiveRole}
                onChange={(e) => setIdentityForm({ ...identityForm, competitiveRole: e.target.value })}
                placeholder="Entry / Duelist / IGL"
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={identityForm.isPrimary}
                  onChange={(e) => setIdentityForm({ ...identityForm, isPrimary: e.target.checked })}
                />
                <label htmlFor="isPrimary" style={{ fontSize: '0.9rem' }}>
                  Set as primary competitive title
                </label>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                Save Game Identity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

