import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { evoqService } from '../services/evoq.service.js';
import { Icon } from './Icons.jsx';
import { Badge } from './ui/Feedback.jsx';

const SUPPORTED_GAMES_CONFIG = [
  {
    slug: 'free-fire',
    name: 'Free Fire',
    shortName: 'FF',
    genre: 'Battle Royale',
    platform: 'Mobile',
    badge: 'SURVIVAL SQUAD',
    desc: 'Fast-paced mobile battle royale survival combat.',
    fields: [
      { key: 'inGameName', label: 'In-Game Name (IGN)', placeholder: 'e.g. VORTEX_PRO', required: true },
      { key: 'inGameUid', label: 'Player UID', placeholder: 'e.g. 192837465', required: true },
    ],
  },
  {
    slug: 'bgmi',
    name: 'BGMI',
    shortName: 'BGMI',
    genre: 'Battle Royale',
    platform: 'Mobile',
    badge: 'TACTICAL BR',
    desc: 'Battlegrounds Mobile India tactical squad tournaments.',
    fields: [
      { key: 'inGameName', label: 'In-Game Name (IGN)', placeholder: 'e.g. SoulMortal', required: true },
      { key: 'inGameUid', label: 'Character ID / Player ID', placeholder: 'e.g. 5123456789', required: true },
    ],
  },
  {
    slug: 'valorant',
    name: 'Valorant',
    shortName: 'VAL',
    genre: 'Tactical Shooter',
    platform: 'PC',
    badge: '5V5 TAC SHOOTER',
    desc: 'Precise gunplay and character utility executes.',
    fields: [
      { key: 'inGameName', label: 'Riot ID', placeholder: 'e.g. TenZ', required: true },
      { key: 'tagline', label: 'Tagline', placeholder: 'e.g. NA1 or 1234', required: true },
      { key: 'serverRegion', label: 'Server Region', placeholder: 'e.g. AP / IN / EU / NA', required: false },
    ],
  },
  {
    slug: 'call-of-duty',
    name: 'Call of Duty',
    shortName: 'COD',
    genre: 'Action Shooter',
    platform: 'PC / Mobile',
    badge: 'ACTION FPS',
    desc: 'Premier high-tempo competitive circuits.',
    fields: [
      { key: 'inGameName', label: 'In-Game Name (IGN)', placeholder: 'e.g. GhostOperator', required: true },
      { key: 'inGameUid', label: 'Activision ID', placeholder: 'e.g. Player#1234567', required: true },
    ],
  },
  {
    slug: 'cs2',
    name: 'Counter-Strike 2',
    shortName: 'CS2',
    genre: 'Tactical Shooter',
    platform: 'PC',
    badge: 'VALVE ESPORTS',
    desc: 'Sub-tick precision tactical bomb defusal operations.',
    fields: [
      { key: 'inGameName', label: 'In-Game Name (IGN)', placeholder: 'e.g. s1mple', required: true },
      { key: 'inGameUid', label: 'Steam ID / SteamID64', placeholder: 'e.g. 76561198000000000', required: true },
    ],
  },
];

export default function GamerOnboardingModal({ isOpen, onClose, onComplete }) {
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Game Selection, 2: Profile & Identity, 3: Passport Minted Celebration
  const [dbGames, setDbGames] = useState([]);
  const [selectedGameSlug, setSelectedGameSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState('');
  const [mintedEvoqId, setMintedEvoqId] = useState('');
  const [copied, setCopied] = useState(false);

  // Profile Form State
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [discord, setDiscord] = useState('');
  const [customLinks, setCustomLinks] = useState([]);

  // Game Identity State
  const [gameFields, setGameFields] = useState({});

  useEffect(() => {
    if (user?.username && !displayName) {
      setDisplayName(user.username);
    }
  }, [user]);

  useEffect(() => {
    async function loadGames() {
      try {
        const games = await evoqService.getGames();
        setDbGames(games || []);
      } catch (err) {
        console.error('Failed to load games:', err);
      }
    }
    loadGames();
  }, []);

  if (!isOpen) return null;

  const activeGameConfig = SUPPORTED_GAMES_CONFIG.find((g) => g.slug === selectedGameSlug) || SUPPORTED_GAMES_CONFIG[0];

  const handleGameSelect = (slug) => {
    setSelectedGameSlug(slug);
    setError('');
  };

  const handleGameFieldChange = (key, value) => {
    setGameFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddCustomLink = () => {
    setCustomLinks((prev) => [...prev, { platform: '', url: '' }]);
  };

  const handleCustomLinkChange = (index, field, value) => {
    setCustomLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveCustomLink = (index) => {
    setCustomLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Image Upload Handler
  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result;
      if (type === 'avatar') setUploadingAvatar(true);
      if (type === 'banner') setUploadingBanner(true);
      setError('');

      try {
        const res = await evoqService.uploadMedia(dataUri, file.name);
        if (type === 'avatar') {
          setAvatarUrl(res.url);
        } else {
          setBannerUrl(res.url);
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to upload image. Please try again.');
      } finally {
        if (type === 'avatar') setUploadingAvatar(false);
        if (type === 'banner') setUploadingBanner(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStep1Continue = () => {
    if (!selectedGameSlug) {
      setError('Please select your primary game to proceed.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Mobile number is required for official tournament coordination.');
      return;
    }

    // Validate game fields
    for (const f of activeGameConfig.fields) {
      if (f.required && !gameFields[f.key]?.trim()) {
        setError(`${f.label} is required for ${activeGameConfig.name}.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Find matching gameId from dbGames
      const dbGame = dbGames.find((g) => g.slug === activeGameConfig.slug);
      const gameId = dbGame?.id;

      if (!gameId) {
        throw new Error(`Game configuration for '${activeGameConfig.name}' is being initialized. Please try again.`);
      }

      const slugCandidate = displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `gamer-${user?.id?.slice(0, 8) || Date.now()}`;

      const socialLinksPayload = {};
      if (instagram.trim()) socialLinksPayload.instagram = instagram.trim();
      if (discord.trim()) socialLinksPayload.discord = discord.trim();
      const validCustom = customLinks.filter((l) => l.platform.trim() && l.url.trim());
      if (validCustom.length > 0) socialLinksPayload.customLinks = validCustom;

      const profilePayload = {
        displayName: displayName.trim(),
        slug: slugCandidate,
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        coverUrl: bannerUrl || undefined,
        primaryGameId: gameId,
        inGameName: gameFields.inGameName?.trim() || displayName.trim(),
        socialLinks: Object.keys(socialLinksPayload).length > 0 ? socialLinksPayload : undefined,
        gameIdentity: {
          gameId,
          inGameName: gameFields.inGameName?.trim() || displayName.trim(),
          inGameUid: gameFields.inGameUid?.trim() || undefined,
          tagline: gameFields.tagline?.trim() || undefined,
          serverRegion: gameFields.serverRegion?.trim() || undefined,
        },
      };

      const updatedProfile = await evoqService.updateMyProfile(profilePayload);
      setMintedEvoqId(updatedProfile?.evoqId || 'EVOQ-PRO');
      setStep(3); // Success Screen
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to complete gamer profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEvoqId = () => {
    if (!mintedEvoqId) return;
    navigator.clipboard.writeText(mintedEvoqId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  return (
    <div className="evoq-modal-backdrop" onClick={step === 3 ? handleFinish : undefined} style={{ zIndex: 1100 }}>
      <div
        className="evoq-modal-dialog"
        style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="evoq-modal-header" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--evoq-border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="lime">PASSPORT ONBOARDING</Badge>
              <span style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--evoq-font-mono)' }}>
                STEP 0{step} / 03
              </span>
            </div>
            <h2 className="evoq-modal-title" style={{ fontSize: '1.4rem' }}>
              {step === 1 && 'Select Your Primary Esports Discipline'}
              {step === 2 && 'Complete Verified Gamer Passport'}
              {step === 3 && 'EVOQ Identity Key Minted!'}
            </h2>
          </div>
          {step !== 3 && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="evoq-icon-btn"
              aria-label="Close onboarding modal"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 0 8px 0' }}>
          {error && (
            <div
              className="evoq-alert evoq-alert-danger"
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(255, 77, 77, 0.1)',
                border: '1px solid rgba(255, 77, 77, 0.3)',
                borderRadius: '8px',
                color: '#FF4D4D',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
              role="alert"
            >
              <Icon name="x" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 1: MAIN GAME SELECTION
          ══════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
                Select your primary game to configure game-specific competitive handles, team matchmaking, and verified tournament brackets.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '12px',
                  marginBottom: '28px',
                }}
              >
                {SUPPORTED_GAMES_CONFIG.map((game) => {
                  const isSelected = selectedGameSlug === game.slug;

                  return (
                    <div
                      key={game.slug}
                      onClick={() => handleGameSelect(game.slug)}
                      style={{
                        padding: '18px 20px',
                        background: isSelected ? 'rgba(201, 255, 82, 0.05)' : 'var(--evoq-surface-elevated)',
                        border: isSelected ? '1px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 0 16px rgba(201, 255, 82, 0.15)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'var(--evoq-font-mono)',
                              color: isSelected ? 'var(--evoq-lime)' : 'var(--evoq-text-muted)',
                              fontWeight: 700,
                            }}
                          >
                            {game.badge}
                          </span>
                          <h4 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--evoq-text-primary)' }}>
                            {game.name}
                          </h4>
                        </div>
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid var(--evoq-lime)' : '2px solid var(--evoq-border)',
                            background: isSelected ? 'var(--evoq-lime)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isSelected && <Icon name="check" size={13} color="#080A08" />}
                        </div>
                      </div>

                      <p style={{ margin: '0 0 10px 0', fontSize: '0.84rem', color: 'var(--evoq-text-secondary)', lineHeight: '1.4' }}>
                        {game.desc}
                      </p>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', color: 'var(--evoq-text-secondary)', fontFamily: 'var(--evoq-font-mono)' }}>
                          {game.platform}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', color: 'var(--evoq-text-secondary)', fontFamily: 'var(--evoq-font-mono)' }}>
                          {game.genre}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleStep1Continue}
                  className="evoq-btn evoq-btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  <span>Continue</span>
                  <Icon name="arrow-right" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 2: GAME-SPECIFIC FIELDS & PROFILE COMPLETION
          ══════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={handleFormSubmit} noValidate>
              {/* Selected Game Callout & Change Action */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(201, 255, 82, 0.04)',
                  border: '1px solid var(--evoq-border-accent)',
                  borderRadius: '8px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="tournament" size={18} color="var(--evoq-lime)" />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--evoq-font-mono)', display: 'block' }}>
                      PRIMARY DISCIPLINE
                    </span>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--evoq-text-primary)' }}>
                      {activeGameConfig.name} ({activeGameConfig.platform})
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="evoq-btn evoq-btn-secondary evoq-btn-sm"
                >
                  Change Game
                </button>
              </div>

              {/* 1. Account Identity (Prefilled) */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--evoq-lime)', marginBottom: '14px', fontFamily: 'var(--evoq-font-mono)' }}>
                  01 // ACCOUNT CREDENTIALS
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div className="evoq-form-group">
                    <label className="evoq-label" htmlFor="onboard-displayName">
                      Gamer Display Name <span className="evoq-lime">*</span>
                    </label>
                    <input
                      id="onboard-displayName"
                      type="text"
                      className="evoq-input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. ShadowStrike"
                      required
                    />
                  </div>

                  <div className="evoq-form-group">
                    <label className="evoq-label" htmlFor="onboard-email">
                      Email Address <span style={{ color: 'var(--evoq-text-muted)', fontSize: '0.78rem' }}>(Prefilled)</span>
                    </label>
                    <input
                      id="onboard-email"
                      type="email"
                      className="evoq-input"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Game-Specific Identity Fields */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--evoq-lime)', marginBottom: '14px', fontFamily: 'var(--evoq-font-mono)' }}>
                  02 // {activeGameConfig.name.toUpperCase()} IN-GAME IDENTITY
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {activeGameConfig.fields.map((f) => (
                    <div className="evoq-form-group" key={f.key}>
                      <label className="evoq-label" htmlFor={`onboard-${f.key}`}>
                        {f.label} {f.required && <span className="evoq-lime">*</span>}
                      </label>
                      <input
                        id={`onboard-${f.key}`}
                        type="text"
                        className="evoq-input"
                        value={gameFields[f.key] || ''}
                        onChange={(e) => handleGameFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        required={f.required}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Contact Details */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--evoq-lime)', marginBottom: '14px', fontFamily: 'var(--evoq-font-mono)' }}>
                  03 // VERIFIED CONTACT
                </h4>
                <div className="evoq-form-group">
                  <label className="evoq-label" htmlFor="onboard-phone">
                    Mobile Phone Number <span className="evoq-lime">*</span>
                  </label>
                  <input
                    id="onboard-phone"
                    type="tel"
                    className="evoq-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                  <span className="evoq-form-helper">
                    Required for tournament check-in, lobby invites, and prize distribution. Kept confidential.
                  </span>
                </div>
              </div>

              {/* 4. Visual Identity Uploads */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--evoq-lime)', marginBottom: '14px', fontFamily: 'var(--evoq-font-mono)' }}>
                  04 // VISUAL IDENTITY
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {/* Avatar Upload */}
                  <div className="evoq-form-group">
                    <label className="evoq-label">Gamer Avatar</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: 'var(--evoq-surface-elevated)',
                          border: '1px solid var(--evoq-border)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Icon name="user" size={24} color="var(--evoq-text-muted)" />
                        )}
                      </div>
                      <label className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <Icon name="plus" size={14} />
                        <span>{uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'avatar')}
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="evoq-form-group">
                    <label className="evoq-label">Passport Banner</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '100px',
                          height: '48px',
                          borderRadius: '6px',
                          background: 'var(--evoq-surface-elevated)',
                          border: '1px solid var(--evoq-border)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {bannerUrl ? (
                          <img src={bannerUrl} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--evoq-text-muted)' }}>No Banner</span>
                        )}
                      </div>
                      <label className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <Icon name="plus" size={14} />
                        <span>{uploadingBanner ? 'Uploading...' : 'Upload Banner'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'banner')}
                          disabled={uploadingBanner}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Social Links (Optional) */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--evoq-lime)', margin: 0, fontFamily: 'var(--evoq-font-mono)' }}>
                    05 // SOCIAL CHANNELS (OPTIONAL)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddCustomLink}
                    className="evoq-btn evoq-btn-ghost evoq-btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    + Add Other Link
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                  <div className="evoq-form-group">
                    <label className="evoq-label" htmlFor="onboard-instagram">Instagram Profile</label>
                    <input
                      id="onboard-instagram"
                      type="url"
                      className="evoq-input"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>

                  <div className="evoq-form-group">
                    <label className="evoq-label" htmlFor="onboard-discord">Discord Tag / Link</label>
                    <input
                      id="onboard-discord"
                      type="text"
                      className="evoq-input"
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                      placeholder="username#0000 or discord.gg/..."
                    />
                  </div>
                </div>

                {customLinks.map((link, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="evoq-input"
                      style={{ width: '140px' }}
                      placeholder="Platform"
                      value={link.platform}
                      onChange={(e) => handleCustomLinkChange(idx, 'platform', e.target.value)}
                    />
                    <input
                      type="url"
                      className="evoq-input"
                      style={{ flex: 1 }}
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => handleCustomLinkChange(idx, 'url', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(idx)}
                      className="evoq-icon-btn"
                      title="Remove link"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--evoq-border)' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="evoq-btn evoq-btn-ghost"
                  disabled={submitting}
                >
                  <Icon name="arrow-left" size={16} />
                  <span>Back to Game</span>
                </button>

                <button
                  type="submit"
                  className="evoq-btn evoq-btn-primary"
                  disabled={submitting || uploadingAvatar || uploadingBanner}
                  style={{ minWidth: '220px' }}
                >
                  {submitting ? (
                    <>
                      <div className="evoq-spinner" style={{ width: '16px', height: '16px' }} />
                      <span>Minting Identity...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete & Mint EVOQ ID</span>
                      <Icon name="check" size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 3: EVOQ ID MINTED & CELEBRATION
          ══════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 20px 24px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(201, 255, 82, 0.1)',
                  border: '1px solid var(--evoq-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 0 24px rgba(201, 255, 82, 0.3)',
                }}
              >
                <Icon name="check" size={32} color="var(--evoq-lime)" />
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px 0', color: 'var(--evoq-text-primary)' }}>
                OFFICIAL EVOQ PASSPORT MINTED
              </h3>
              <p style={{ color: 'var(--evoq-text-secondary)', maxWidth: '440px', margin: '0 auto 24px auto', fontSize: '0.92rem' }}>
                Your permanent competitive identity is now recorded on the EVOQ network. Use this permanent ID to form teams, receive invites, and enter verified tournaments.
              </p>

              {/* Prominent EVOQ ID Card */}
              <div
                style={{
                  background: 'var(--evoq-surface-elevated)',
                  border: '1px solid var(--evoq-lime)',
                  borderRadius: '12px',
                  padding: '24px 28px',
                  maxWidth: '460px',
                  margin: '0 auto 28px auto',
                  boxShadow: '0 0 30px rgba(201, 255, 82, 0.12)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--evoq-font-mono)', color: 'var(--evoq-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  PERMANENT GAMER IDENTIFIER
                </span>

                <div
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--evoq-font-mono)',
                    color: 'var(--evoq-lime)',
                    margin: '10px 0 16px 0',
                    textShadow: '0 0 20px rgba(201, 255, 82, 0.4)',
                  }}
                >
                  {mintedEvoqId}
                </div>

                <button
                  type="button"
                  onClick={handleCopyEvoqId}
                  className="evoq-btn evoq-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? 'var(--evoq-lime)' : 'currentColor'} />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy EVOQ ID'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="evoq-btn evoq-btn-primary"
                  style={{ minWidth: '220px' }}
                >
                  <span>Enter Gamer Dashboard</span>
                  <Icon name="arrow-right" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

