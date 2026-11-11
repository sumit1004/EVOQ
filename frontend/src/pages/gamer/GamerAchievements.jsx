import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Badge,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
  PrimaryButton,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function GamerAchievements() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAchievements() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load verified achievements.');
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  const achievements = profile?.achievements || [];

  return (
    <GamerLayout
      title="Verified Achievements"
      actions={
        <Link to="/gamer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
          <Icon name="trophy" size={14} />
          <span>Compete for Trophies</span>
        </Link>
      }
    >
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', margin: 0 }}>
          Every tournament result approved by referees produces an immutable, verifiable achievement on your permanent gamer record.
        </p>
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="card" count={3} height="150px" />
      ) : achievements.length === 0 ? (
        <EmptyState
          icon="trophy"
          title="No Verified Achievements Yet"
          description="Compete in EVOQ verified tournaments. Podium finishes and championship runs generate permanent credentials on your public player profile."
          action={
            <Link to="/gamer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              Explore Tournaments
            </Link>
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="evoq-card evoq-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: 'var(--evoq-border-accent)',
                backgroundColor: '#111710',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Badge variant="lime">{ach.type || 'CHAMPIONSHIP'}</Badge>
                  <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--evoq-font-mono)' }}>
                    {new Date(ach.awardedAt || ach.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--evoq-text-primary)' }}>
                  {ach.title}
                </h3>

                <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', margin: '0 0 16px 0' }}>
                  Game Title: <strong style={{ color: 'var(--evoq-lime)' }}>{ach.game?.name || 'Competitive Title'}</strong>
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--evoq-bg)',
                  padding: '12px 14px',
                  borderRadius: 'var(--evoq-radius-sm)',
                  fontSize: '0.76rem',
                  color: 'var(--evoq-text-muted)',
                  border: '1px solid var(--evoq-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>STATUS</span>
                  <strong style={{ color: 'var(--evoq-lime)' }}>VERIFIED IMMUTABLE</strong>
                </div>
                {ach.tournament && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>EVENT</span>
                    <strong style={{ color: 'var(--evoq-text-secondary)' }}>
                      {ach.tournament.name || ach.tournament.title}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GamerLayout>
  );
}
