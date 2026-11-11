import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Badge,
  StatusIndicator,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
  PrimaryButton,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function GamerMatches() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load official match history.');
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const careerRecords = profile?.careerRecords || [];

  return (
    <GamerLayout
      title="Competitive Matches"
      actions={
        <Link to="/gamer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
          <Icon name="tournament" size={14} />
          <span>Browse Tournaments</span>
        </Link>
      }
    >
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', margin: 0 }}>
          Official tournament fixtures, scheduled match lobbies, and verified scorelines.
        </p>
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="card" count={3} height="120px" />
      ) : careerRecords.length === 0 ? (
        <EmptyState
          icon="matches"
          title="No Match History Recorded"
          description="Register for an open tournament to play competitive fixtures. Match outcomes appear here automatically."
          action={
            <Link to="/gamer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              Discover Tournaments
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {careerRecords.map((item) => (
            <div
              key={item.id}
              className="evoq-card evoq-card-hover"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '18px 22px',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <Badge variant="lime" size="sm">{item.game?.name || 'Esports'}</Badge>
                  <Badge variant="neutral" size="sm">
                    {item.placement ? `Rank #${item.placement}` : 'COMPETITOR'}
                  </Badge>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--evoq-text-primary)' }}>
                  {item.tournament?.name || item.tournament?.title || 'Sanctioned Match'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                  Recorded on {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <StatusIndicator status="approved" label="VERIFIED RESULT" />
                {item.tournament?.slug && (
                  <Link
                    to={`/gamer/tournaments/${item.tournament.slug}`}
                    className="evoq-btn evoq-btn-secondary evoq-btn-sm"
                  >
                    <span>Event Details</span>
                    <Icon name="arrow-right" size={13} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GamerLayout>
  );
}
