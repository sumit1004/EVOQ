import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
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

export default function GamerProfileEdit() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedEvoqId, setCopiedEvoqId] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    evoqId: '',
    displayName: '',
    inGameName: '',
    phoneNumber: '',
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
  const [newIdTagline, setNewIdTagline] = useState('');
  const [newIdIgn, setNewIdIgn] = useState('');
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
            evoqId: profData.evoqId || '',
            displayName: profData.displayName || '',
            inGameName: profData.inGameName || '',
            phoneNumber: profData.phoneNumber || '',
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

  const handleCopyEvoqId = () => {
    if (!profileForm.evoqId) return;
    navigator.clipboard.writeText(profileForm.evoqId);
    setCopiedEvoqId(true);
    setTimeout(() => setCopiedEvoqId(false), 2000);
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
            setProfileForm((prev) => ({ ...prev, [field]: url }));
            setSuccess(`Uploaded ${field === 'avatarUrl' ? 'Avatar' : 'Banner'} successfully!`);
          }
        } catch (uploadErr) {
          setError(uploadErr.response?.data?.error?.message || 'Media upload failed.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('File read failed.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.updateMyProfile(profileForm);
      setSuccess('Player passport updated successfully!');
      setTimeout(() => navigate('/gamer/profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIdentity = async (e) => {
    e.preventDefault();
    if (!newIdIdentifier.trim() && !newIdIgn.trim()) return;
    setAddingId(true);
    setError('');
    try {
      const added = await evoqService.addGameIdentity({
        gameId: newIdGameId,
        inGameIdentifier: newIdIdentifier.trim() || newIdIgn.trim(),
        inGameName: newIdIgn.trim() || newIdIdentifier.trim(),
        tagline: newIdTagline.trim() || undefined,
        region: newIdRegion.trim() || undefined,
      });
      setIdentities((prev) => [...prev, added]);
      setNewIdIdentifier('');
      setNewIdTagline('');
      setNewIdIgn('');
      setNewIdRegion('');
      setSuccess('Game identity connected!');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to link game ID.');
    } finally {
      setAddingId(false);
    }
  };

  const selectedGame = games.find((g) => g.id === newIdGameId);
  const selectedGameSlug = selectedGame?.slug || '';

  return (
    <GamerLayout
      title="Edit Gamer Passport"
      actions={
        <Link to="/gamer/profile" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
          <Icon name="arrow-left" size={14} />
          <span>View Passport</span>
        </Link>
      }
    >
      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="evoq-alert evoq-alert-success" role="alert">
          <Icon name="check" size={16} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="card" count={2} height="200px" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* ── Left Column: Core Gamer Profile ── */}
          <div className="evoq-card">
            <SectionHeader
              title="Identity & Passport Details"
              subtitle="Shown on tournament rosters, match cards, and player profiles"
            />

            <form onSubmit={handleSaveProfile} noValidate>
              {profileForm.evoqId && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    marginBottom: '18px',
                    backgroundColor: 'rgba(201, 255, 82, 0.06)',
                    border: '1px solid rgba(201, 255, 82, 0.3)',
                    borderRadius: 'var(--evoq-radius-sm)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--evoq-font-mono)' }}>
                      PERMANENT EVOQ ID (READ ONLY)
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--evoq-lime)', fontFamily: 'var(--evoq-font-mono)', letterSpacing: '0.05em' }}>
                      {profileForm.evoqId}
                    </div>
                  </div>
                  <SecondaryButton
                    type="button"
                    size="sm"
                    icon={copiedEvoqId ? 'check' : 'copy'}
                    onClick={handleCopyEvoqId}
                  >
                    {copiedEvoqId ? 'Copied' : 'Copy ID'}
                  </SecondaryButton>
                </div>
              )}

              <Input
                label="Display Name"
                id="displayName"
                name="displayName"
                value={profileForm.displayName}
                onChange={handleChange}
                placeholder="e.g. Alex Hunter"
                helperText="Your competitive stage name or preferred alias."
              />

              <Input
                label="Emergency Contact Phone"
                id="phoneNumber"
                name="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                helperText="Confidential: Only used by tournament admins for match alerts. Never shown on your public profile."
              />

              <Input
                label="Primary In-Game Handle"
                id="inGameName"
                name="inGameName"
                value={profileForm.inGameName}
                onChange={handleChange}
                placeholder="e.g. ShadowStrike#NA1"
              />

              <Input
                label="Country / Region"
                id="country"
                name="country"
                value={profileForm.country}
                onChange={handleChange}
                placeholder="e.g. United States, Germany, Japan"
              />

              <Select
                label="Primary Esports Title"
                id="primaryGameId"
                name="primaryGameId"
                value={profileForm.primaryGameId}
                onChange={handleChange}
                placeholder="Select Primary Game"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>

              <Textarea
                label="Player Biography"
                id="bio"
                name="bio"
                value={profileForm.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Detail your competitive background, roles played, and team ambitions..."
              />

              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Avatar Image URL"
                  id="avatarUrl"
                  name="avatarUrl"
                  value={profileForm.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  helperText="Direct image URL or upload directly from disk."
                />
                <label className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '-6px' }}>
                  <Icon name="plus" size={13} />
                  <span>Upload Avatar Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'avatarUrl')}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Banner Image URL"
                  id="bannerUrl"
                  name="bannerUrl"
                  value={profileForm.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                  helperText="Wide header banner (1920x400 recommended)."
                />
                <label className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '-6px' }}>
                  <Icon name="plus" size={13} />
                  <span>Upload Banner Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                  />
                </label>
              </div>

              <PrimaryButton
                type="submit"
                disabled={saving}
                loading={saving}
                size="lg"
                fullWidth
                style={{ marginTop: '12px' }}
              >
                {saving ? 'Saving Changes...' : 'Save Player Passport'}
              </PrimaryButton>
            </form>
          </div>

          {/* ── Right Column: Connected Games ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Connected Game Accounts */}
            <div className="evoq-card">
              <SectionHeader
                title="Connected Game Accounts"
                subtitle="Link Riot, Steam, and Epic IDs for automatic tournament lobby access"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {identities.length === 0 ? (
                  <p style={{ color: 'var(--evoq-text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    No publisher handles connected yet. Add one below to enter title-specific tournaments.
                  </p>
                ) : (
                  identities.map((id) => (
                    <div
                      key={id.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        backgroundColor: 'var(--evoq-surface-elevated)',
                        borderRadius: 'var(--evoq-radius-sm)',
                        border: '1px solid var(--evoq-border)',
                      }}
                    >
                      <div>
                        <span className="evoq-mono-label" style={{ color: 'var(--evoq-lime)' }}>
                          {id.game?.name || 'Game Title'}
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--evoq-text-primary)' }}>
                          {id.inGameIdentifier || id.inGameName}
                          {id.tagline ? <span style={{ color: 'var(--evoq-lime)' }}>#{id.tagline}</span> : null}
                        </div>
                        {id.region && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
                            Region: {id.region}
                          </div>
                        )}
                      </div>
                      {id.isVerified ? (
                        <Badge variant="lime" size="sm">VERIFIED</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">CONNECTED</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New Game ID Form */}
              <div style={{ paddingTop: '20px', borderTop: '1px solid var(--evoq-border)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--evoq-text-primary)' }}>
                  Connect Publisher Handle
                </h4>

                <form onSubmit={handleAddIdentity} noValidate>
                  <Select
                    label="Select Esports Title"
                    id="newIdGameId"
                    value={newIdGameId}
                    onChange={(e) => {
                      setNewIdGameId(e.target.value);
                      setNewIdIdentifier('');
                      setNewIdTagline('');
                      setNewIdIgn('');
                    }}
                    required
                  >
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>

                  {selectedGameSlug === 'valorant' ? (
                    <>
                      <Input
                        label="Riot ID (In-Game Name)"
                        id="newIdIgn"
                        value={newIdIgn}
                        onChange={(e) => setNewIdIgn(e.target.value)}
                        placeholder="e.g. TenZ"
                        required
                        helperText="Your public Valorant display name."
                      />
                      <Input
                        label="Tagline (without #)"
                        id="newIdTagline"
                        value={newIdTagline}
                        onChange={(e) => setNewIdTagline(e.target.value.replace(/^#/, ''))}
                        placeholder="e.g. NA1"
                        required
                        helperText="3-5 character Riot tagline."
                      />
                    </>
                  ) : selectedGameSlug === 'free-fire' ? (
                    <>
                      <Input
                        label="In-Game Name (IGN)"
                        id="newIdIgn"
                        value={newIdIgn}
                        onChange={(e) => setNewIdIgn(e.target.value)}
                        placeholder="e.g. TotalGaming"
                        required
                      />
                      <Input
                        label="Free Fire UID (8-12 digits)"
                        id="newIdIdentifier"
                        value={newIdIdentifier}
                        onChange={(e) => setNewIdIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 512345678"
                        required
                        helperText="Numeric user identifier found on your Free Fire profile."
                      />
                    </>
                  ) : selectedGameSlug === 'bgmi' ? (
                    <>
                      <Input
                        label="In-Game Name (IGN)"
                        id="newIdIgn"
                        value={newIdIgn}
                        onChange={(e) => setNewIdIgn(e.target.value)}
                        placeholder="e.g. Jonathan"
                        required
                      />
                      <Input
                        label="BGMI Character ID (9-11 digits)"
                        id="newIdIdentifier"
                        value={newIdIdentifier}
                        onChange={(e) => setNewIdIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 512345678"
                        required
                        helperText="Numeric character ID found on your BGMI profile."
                      />
                    </>
                  ) : selectedGameSlug === 'call-of-duty' ? (
                    <>
                      <Input
                        label="Activision ID"
                        id="newIdIdentifier"
                        value={newIdIdentifier}
                        onChange={(e) => setNewIdIdentifier(e.target.value)}
                        placeholder="e.g. Ghost#1234567"
                        required
                        helperText="Full Activision ID including the trailing numbers."
                      />
                    </>
                  ) : selectedGameSlug === 'cs2' ? (
                    <>
                      <Input
                        label="In-Game Name"
                        id="newIdIgn"
                        value={newIdIgn}
                        onChange={(e) => setNewIdIgn(e.target.value)}
                        placeholder="e.g. s1mple"
                        required
                      />
                      <Input
                        label="SteamID64 (17 digits)"
                        id="newIdIdentifier"
                        value={newIdIdentifier}
                        onChange={(e) => setNewIdIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 76561198000000000"
                        required
                        helperText="Your 17-digit Steam community 64 ID."
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="In-Game Name (IGN)"
                        id="newIdIgn"
                        value={newIdIgn}
                        onChange={(e) => setNewIdIgn(e.target.value)}
                        placeholder="e.g. CompetitorName"
                      />
                      <Input
                        label="In-Game Identifier / Account ID"
                        id="newIdIdentifier"
                        value={newIdIdentifier}
                        onChange={(e) => setNewIdIdentifier(e.target.value)}
                        placeholder="e.g. PlayerOne#EUW"
                        required
                      />
                    </>
                  )}

                  <Input
                    label="Server Region (Optional)"
                    id="newIdRegion"
                    value={newIdRegion}
                    onChange={(e) => setNewIdRegion(e.target.value)}
                    placeholder="e.g. NA, EU-WEST, ASIA"
                  />

                  <SecondaryButton
                    type="submit"
                    disabled={addingId || (!newIdIdentifier.trim() && !newIdIgn.trim())}
                    loading={addingId}
                    icon="plus"
                    fullWidth
                  >
                    {addingId ? 'Connecting...' : 'Link Game Handle'}
                  </SecondaryButton>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </GamerLayout>
  );
}
