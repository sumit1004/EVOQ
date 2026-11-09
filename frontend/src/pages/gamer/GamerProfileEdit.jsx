import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function GamerProfileEdit() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    inGameName: '',
    slug: '',
    bio: '',
    country: '',
    avatarUrl: '',
    bannerUrl: '',
    primaryGameId: '',
  });

  // Existing identities
  const [identities, setIdentities] = useState([]);

  // New Identity Form
  const [newIdGameId, setNewIdGameId] = useState('');
  const [newIdIdentifier, setNewIdIdentifier] = useState('');
  const [newIdRegion, setNewIdRegion] = useState('');
  const [addingId, setAddingId] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [profData, gamesList] = await Promise.all([
          evoqService.getMyProfile(),
          evoqService.getGames(),
        ]);
        setGames(gamesList || []);
        if (profData) {
          setProfileForm({
            displayName: profData.displayName || '',
            inGameName: profData.inGameName || '',
            slug: profData.slug || '',
            bio: profData.bio || '',
            country: profData.country || '',
            avatarUrl: profData.avatarUrl || '',
            bannerUrl: profData.bannerUrl || '',
            primaryGameId: profData.primaryGameId || '',
          });
          setIdentities(profData.gameIdentities || []);
        }
        if (gamesList && gamesList.length > 0 && !newIdGameId) {
          setNewIdGameId(gamesList[0].id);
        }
      } catch (err) {
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.updateMyProfile(profileForm);
      setSuccess('Player card updated successfully!');
      setTimeout(() => navigate('/gamer/profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIdentity = async (e) => {
    e.preventDefault();
    if (!newIdIdentifier.trim()) return;
    setAddingId(true);
    setError('');
    try {
      const added = await evoqService.addGameIdentity({
        gameId: newIdGameId,
        inGameIdentifier: newIdIdentifier.trim(),
        region: newIdRegion.trim() || null,
      });
      setIdentities((prev) => [...prev.filter((i) => i.gameId !== newIdGameId), added]);
      setNewIdIdentifier('');
      setNewIdRegion('');
      setSuccess('Game account identity linked!');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add game identity.');
    } finally {
      setAddingId(false);
    }
  };

  const handleRemoveIdentity = async (gameId) => {
    if (!confirm('Remove this game identity from your player card?')) return;
    try {
      await evoqService.removeGameIdentity(gameId);
      setIdentities((prev) => prev.filter((i) => i.gameId !== gameId));
      setSuccess('Game identity removed.');
    } catch (err) {
      setError('Failed to remove identity.');
    }
  };

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container" style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.4rem' }}>
              ESPORTS PLAYER CARD
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Edit Gamer Profile</h1>
          </div>
          <Link to="/gamer/profile" className="nebula-btn nebula-btn-secondary nebula-btn-sm">
            ← Cancel &amp; Return
          </Link>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}
        {success && <div className="nebula-alert nebula-alert-success">{success}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <p>Loading editor...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Identity Details Form */}
            <form onSubmit={handleSaveProfile} className="nebula-card">
              <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>
                Core Gamer Details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="nebula-form-group">
                  <label className="nebula-label" htmlFor="displayName">Display Name</label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={profileForm.displayName}
                    onChange={handleChange}
                    placeholder="e.g. Alex 'Shroud' Rivera"
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label" htmlFor="inGameName">Primary In-Game Name *</label>
                  <input
                    id="inGameName"
                    name="inGameName"
                    type="text"
                    value={profileForm.inGameName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. TenZ#1337"
                    className="nebula-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="nebula-form-group">
                  <label className="nebula-label" htmlFor="slug">Custom URL Slug *</label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={profileForm.slug}
                    onChange={handleChange}
                    required
                    placeholder="my-unique-handle"
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label" htmlFor="country">Country / Region</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={profileForm.country}
                    onChange={handleChange}
                    placeholder="e.g. United States, Germany, India"
                    className="nebula-input"
                  />
                </div>
              </div>

              <div className="nebula-form-group">
                <label className="nebula-label" htmlFor="primaryGameId">Primary Focus Game</label>
                <select
                  id="primaryGameId"
                  name="primaryGameId"
                  value={profileForm.primaryGameId}
                  onChange={handleChange}
                  className="nebula-select"
                >
                  <option value="">Select Primary Title</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.genre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="nebula-form-group">
                <label className="nebula-label" htmlFor="bio">Player Bio &amp; Achievements Summary</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tell tournament organizers and squad scouts about your competitive history..."
                  className="nebula-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="nebula-form-group">
                  <label className="nebula-label" htmlFor="avatarUrl">Avatar Image URL</label>
                  <input
                    id="avatarUrl"
                    name="avatarUrl"
                    type="url"
                    value={profileForm.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label" htmlFor="bannerUrl">Banner Image URL</label>
                  <input
                    id="bannerUrl"
                    name="bannerUrl"
                    type="url"
                    value={profileForm.bannerUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="nebula-input"
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="nebula-btn nebula-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Player Card'}
                </button>
              </div>
            </form>

            {/* Link Game Identities Card */}
            <div className="nebula-card">
              <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>
                 Connect Game Accounts
              </h2>
              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Linking your publisher accounts (Riot ID, Steam ID, Epic Games) enables automatic roster verification in title-specific brackets.
              </p>

              {/* Add Identity form */}
              <form onSubmit={handleAddIdentity} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                  <label className="nebula-label">Game Title</label>
                  <select
                    value={newIdGameId}
                    onChange={(e) => setNewIdGameId(e.target.value)}
                    className="nebula-select"
                  >
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="nebula-label">In-Game Identifier *</label>
                  <input
                    type="text"
                    value={newIdIdentifier}
                    onChange={(e) => setNewIdIdentifier(e.target.value)}
                    placeholder="e.g. Player#NA1 or SteamID64"
                    required
                    className="nebula-input"
                  />
                </div>
                <div>
                  <label className="nebula-label">Region (optional)</label>
                  <input
                    type="text"
                    value={newIdRegion}
                    onChange={(e) => setNewIdRegion(e.target.value)}
                    placeholder="e.g. NA, EUW"
                    className="nebula-input"
                  />
                </div>
                <button
                  type="submit"
                  className="nebula-btn nebula-btn-cyan"
                  disabled={addingId}
                >
                  {addingId ? 'Adding...' : '+ Link'}
                </button>
              </form>

              {/* Existing connected identities table */}
              {identities.length === 0 ? (
                <div className="nebula-empty-state" style={{ padding: '1.5rem' }}>
                  <p>No game identities connected yet.</p>
                </div>
              ) : (
                <div className="nebula-table-wrapper">
                  <table className="nebula-table">
                    <thead>
                      <tr>
                        <th>Game</th>
                        <th>Identifier / Handle</th>
                        <th>Region</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {identities.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.game?.name || 'Game'}</strong></td>
                          <td><code>{item.inGameIdentifier || item.inGameName}</code></td>
                          <td>{item.region || 'Global'}</td>
                          <td>
                            <span className="nebula-badge nebula-badge-lime">
                              {item.isVerified ? 'VERIFIED' : 'CONNECTED'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveIdentity(item.gameId)}
                              className="nebula-btn nebula-btn-coral nebula-btn-sm"
                            >
                              Disconnect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

