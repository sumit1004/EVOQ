import React, { useState, useEffect } from 'react';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
  Input,
  Select,
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatusIndicator,
  Avatar,
  EmptyState,
  SkeletonLoader,
  DataTable,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerCompetitionManager({ tournament, onRefreshTournament }) {
  const [rounds, setRounds] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [roundDetails, setRoundDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showCreateRoundModal, setShowCreateRoundModal] = useState(false);
  const [newRoundForm, setNewRoundForm] = useState({ name: '', roundType: 'GROUP' });
  const [creatingRound, setCreatingRound] = useState(false);

  // Group creation & team allocation modal
  const [showCreateGroupsModal, setShowCreateGroupsModal] = useState(false);
  const [allocationMode, setAllocationMode] = useState('MANUAL'); // 'MANUAL' | 'RANDOM'
  const [eligibleData, setEligibleData] = useState(null);
  const [manualGroups, setManualGroups] = useState([
    { name: 'Group A', capacity: 4, registrationIds: [] },
  ]);
  const [randomGroupCount, setRandomGroupCount] = useState(1);
  const [randomGroupCapacity, setRandomGroupCapacity] = useState('');
  const [randomPreview, setRandomPreview] = useState(null);
  const [randomUnassigned, setRandomUnassigned] = useState([]);
  const [randomEffectiveCap, setRandomEffectiveCap] = useState(null);
  const [submittingGroups, setSubmittingGroups] = useState(false);

  // Match creation modal
  const [showCreateMatchesModal, setShowCreateMatchesModal] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState(null);
  const [matchCount, setMatchCount] = useState(2);
  const [creatingMatches, setCreatingMatches] = useState(false);

  // Credentials modal
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [credForm, setCredForm] = useState({
    roomId: '',
    roomPassword: '',
    lobbyDetails: '',
    accessInstructions: '',
    isReleased: false,
  });
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [copyingCredentials, setCopyingCredentials] = useState(false);

  // Enter Results modal
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsTargetMatch, setResultsTargetMatch] = useState(null);
  const [resultsRows, setResultsRows] = useState([]);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidencePreview, setEvidencePreview] = useState('');
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [resultsNotes, setResultsNotes] = useState('');
  const [submittingResults, setSubmittingResults] = useState(false);

  // Standings modal (Group or Round)
  const [showStandingsModal, setShowStandingsModal] = useState(false);
  const [standingsTitle, setStandingsTitle] = useState('');
  const [standingsRows, setStandingsRows] = useState([]);
  const [loadingStandings, setLoadingStandings] = useState(false);

  // Qualification modal
  const [showQualifyModal, setShowQualifyModal] = useState(false);
  const [qualifyMethod, setQualifyMethod] = useState('TOP_N');
  const [advancePerGroup, setAdvancePerGroup] = useState(2);
  const [selectedQualRegIds, setSelectedQualRegIds] = useState([]);
  const [qualifying, setQualifying] = useState(false);

  // Advance to Next Round modal
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [nextRoundName, setNextRoundName] = useState('');
  const [nextRoundType, setNextRoundType] = useState('GROUP');
  const [advancing, setAdvancing] = useState(false);

  // Deletion modals
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'ROUND' | 'GROUP' | 'MATCH', id: '...', name: '...' }
  const [deletingItem, setDeletingItem] = useState(false);

  // Load rounds
  const loadRounds = async (preferredRoundId = null) => {
    if (!tournament?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getTournamentRounds(tournament.id);
      setRounds(data || []);

      const activeId = preferredRoundId || (data && data.length > 0 ? data[0].id : null);
      if (activeId) {
        setSelectedRoundId(activeId);
        await loadRoundDetails(activeId);
      } else {
        setSelectedRoundId(null);
        setRoundDetails(null);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load tournament rounds.');
    } finally {
      setLoading(false);
    }
  };

  const loadRoundDetails = async (roundId) => {
    if (!roundId) return;
    setLoadingDetails(true);
    try {
      const details = await evoqService.getRoundDetails(roundId);
      setRoundDetails(details);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load round details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadRounds();
  }, [tournament?.id]);

  // Round selection
  const handleSelectRound = async (roundId) => {
    setSelectedRoundId(roundId);
    setError('');
    setSuccess('');
    await loadRoundDetails(roundId);
  };

  // 1. Create Round
  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!newRoundForm.name.trim()) return;
    setCreatingRound(true);
    setError('');
    try {
      const created = await evoqService.createTournamentRound(tournament.id, newRoundForm);
      setSuccess(`Round "${created.name}" created successfully.`);
      setShowCreateRoundModal(false);
      setNewRoundForm({ name: '', roundType: 'GROUP' });
      await loadRounds(created.id);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create tournament round.');
    } finally {
      setCreatingRound(false);
    }
  };

  // 2. Open Create Groups Modal & Fetch Eligible Teams
  const handleOpenCreateGroups = async () => {
    setError('');
    setSuccess('');
    try {
      const eligible = await evoqService.getEligibleTeams(selectedRoundId);
      setEligibleData(eligible);
      const unallocated = eligible.teams.filter((t) => !t.isAllocated);
      const defaultCap = Math.max(1, unallocated.length || 4);

      setManualGroups([
        { name: 'Group A', capacity: defaultCap, registrationIds: [] },
      ]);
      setRandomGroupCount(1);
      setRandomGroupCapacity(defaultCap);
      setRandomPreview(null);
      setRandomUnassigned([]);
      setRandomEffectiveCap(defaultCap);
      setShowCreateGroupsModal(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch eligible teams.');
    }
  };

  // Add / Remove Manual Group in Modal
  const handleAddManualGroup = () => {
    const nextLetter = String.fromCharCode(65 + manualGroups.length);
    const defaultCap = manualGroups[0]?.capacity || 4;
    setManualGroups([...manualGroups, { name: `Group ${nextLetter}`, capacity: defaultCap, registrationIds: [] }]);
  };

  const handleRemoveManualGroup = (index) => {
    if (manualGroups.length <= 1) return;
    const updated = manualGroups.filter((_, idx) => idx !== index);
    setManualGroups(updated);
  };

  const handleManualGroupCapacityChange = (index, value) => {
    const num = Number(value);
    const updated = [...manualGroups];
    updated[index].capacity = num > 0 ? num : 1;
    setManualGroups(updated);
  };

  const handleToggleTeamInGroup = (groupIndex, regId) => {
    const targetGroup = manualGroups[groupIndex];
    const isAlreadyInTarget = targetGroup.registrationIds.includes(regId);

    if (!isAlreadyInTarget) {
      if (targetGroup.capacity && targetGroup.registrationIds.length >= targetGroup.capacity) {
        setError(`Group "${targetGroup.name}" is at maximum capacity (${targetGroup.capacity} teams). Increase capacity to add more teams.`);
        return;
      }
    }

    setError('');
    const updated = manualGroups.map((g, idx) => {
      // Remove from any other group
      const filtered = g.registrationIds.filter((id) => id !== regId);
      if (idx === groupIndex) {
        if (isAlreadyInTarget) {
          return { ...g, registrationIds: filtered };
        } else {
          return { ...g, registrationIds: [...filtered, regId] };
        }
      }
      return { ...g, registrationIds: filtered };
    });
    setManualGroups(updated);
  };

  // Randomize Preview (Sequential Allocation according to capacity)
  const handleRandomizePreview = async () => {
    setError('');
    try {
      const cap = randomGroupCapacity ? Number(randomGroupCapacity) : undefined;
      const preview = await evoqService.randomizeGroupAllocation(selectedRoundId, {
        groupCount: Number(randomGroupCount) || 1,
        groupCapacity: cap,
        commit: false,
      });
      setRandomPreview(preview.distribution);
      setRandomUnassigned(preview.unassignedRegistrationIds || []);
      setRandomEffectiveCap(preview.effectiveCapacity);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to randomize teams.');
    }
  };

  // Commit Groups
  const handleCommitGroups = async () => {
    setSubmittingGroups(true);
    setError('');
    try {
      let payloadGroups = [];
      if (allocationMode === 'MANUAL') {
        payloadGroups = manualGroups.filter((g) => g.name.trim()).map((g) => ({
          name: g.name.trim(),
          capacity: g.capacity ? Number(g.capacity) : undefined,
          registrationIds: g.registrationIds,
        }));
      } else {
        if (!randomPreview) {
          await handleRandomizePreview();
        }
        payloadGroups = (randomPreview || []).map((g) => ({
          name: g.name,
          capacity: g.capacity ? Number(g.capacity) : undefined,
          registrationIds: g.registrationIds,
        }));
      }

      await evoqService.createGroupsWithAllocation(selectedRoundId, { groups: payloadGroups });
      setSuccess('Groups created and teams allocated sequentially.');
      setShowCreateGroupsModal(false);
      await loadRoundDetails(selectedRoundId);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to commit group allocation.');
    } finally {
      setSubmittingGroups(false);
    }
  };

  // 3. Create Matches in Group
  const handleOpenCreateMatches = (groupId) => {
    setTargetGroupId(groupId);
    setMatchCount(2);
    setShowCreateMatchesModal(true);
  };

  const handleCreateMatches = async (e) => {
    e.preventDefault();
    setCreatingMatches(true);
    setError('');
    try {
      await evoqService.createGroupMatches(targetGroupId, { matchCount: Number(matchCount) });
      setSuccess(`${matchCount} match(es) created successfully for this group.`);
      setShowCreateMatchesModal(false);
      await loadRoundDetails(selectedRoundId);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create matches.');
    } finally {
      setCreatingMatches(false);
    }
  };

  // 4. Room Credentials Modal
  const handleOpenCredentials = async (match) => {
    setSelectedMatch(match);
    setError('');
    try {
      const cred = await evoqService.getMatchCredentials(match.id).catch(() => null);
      if (cred) {
        setCredForm({
          roomId: cred.roomId || '',
          roomPassword: cred.roomPassword || '',
          lobbyDetails: cred.lobbyDetails || '',
          accessInstructions: cred.accessInstructions || '',
          isReleased: Boolean(cred.isReleased),
        });
      } else {
        setCredForm({
          roomId: '',
          roomPassword: '',
          lobbyDetails: '',
          accessInstructions: '',
          isReleased: false,
        });
      }
      setShowCredentialsModal(true);
    } catch (err) {
      setError('Failed to load room credentials.');
    }
  };

  const handleCopyPreviousCredentials = async () => {
    if (!selectedMatch) return;
    setCopyingCredentials(true);
    try {
      const copied = await evoqService.copyMatchCredentials(selectedMatch.id);
      setCredForm({
        roomId: copied.roomId,
        roomPassword: copied.roomPassword,
        lobbyDetails: copied.lobbyDetails || '',
        accessInstructions: copied.accessInstructions || '',
        isReleased: false,
      });
      setSuccess('Credentials copied from previous match in this group.');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No previous match credentials found.');
    } finally {
      setCopyingCredentials(false);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setSavingCredentials(true);
    setError('');
    try {
      await evoqService.setMatchCredentials(selectedMatch.id, credForm);
      setSuccess(
        credForm.isReleased
          ? 'Room credentials saved and released to participating competitors!'
          : 'Room credentials saved as draft.'
      );
      setShowCredentialsModal(false);
      await loadRoundDetails(selectedRoundId);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save room credentials.');
    } finally {
      setSavingCredentials(false);
    }
  };

  // 5. Enter Results Modal
  const handleOpenEnterResults = (match) => {
    setResultsTargetMatch(match);
    setError('');
    setEvidenceUrl('');
    setEvidencePreview('');
    setResultsNotes('');

    // Prepare participants rows with default placements & eliminations
    const participants = match.participants || [];
    const initialRows = participants.map((p, idx) => ({
      registrationId: p.registrationId,
      teamName: p.registration?.team?.name || p.registration?.gamerProfile?.displayName || `Team ${idx + 1}`,
      logoUrl: p.registration?.team?.logoUrl || p.registration?.gamerProfile?.avatarUrl,
      slot: p.slot || idx + 1,
      placement: p.metrics?.placement || idx + 1,
      eliminations: p.metrics?.eliminations ?? 0,
    }));

    setResultsRows(initialRows);
    setShowResultsModal(true);
  };

  const handleResultRowChange = (index, field, value) => {
    const updated = [...resultsRows];
    updated[index][field] = Number(value);
    setResultsRows(updated);
  };

  // Screenshot upload
  const handleEvidenceFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Evidence image exceeds 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Uri = reader.result;
      setEvidencePreview(base64Uri);
      setUploadingEvidence(true);
      try {
        const uploaded = await evoqService.uploadEvidence(base64Uri, `match-${resultsTargetMatch.id}-proof`);
        setEvidenceUrl(uploaded.url);
        setSuccess('Match proof screenshot uploaded successfully.');
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to upload screenshot evidence.');
      } finally {
        setUploadingEvidence(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Calculate live preview points for a row
  const calculatePointsPreview = (placement, eliminations) => {
    const scoringRuleset = tournament.formatConfig?.scoringRuleset || {};
    const placementPointsTable = scoringRuleset.placementPoints || {
      1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
    };
    const elimValue = Number(scoringRuleset.eliminationPointValue || 1);

    const placePts = placementPointsTable[placement] !== undefined ? Number(placementPointsTable[placement]) : 0;
    const elimPts = Number(eliminations || 0) * elimValue;
    return {
      placementPoints: placePts,
      eliminationPoints: elimPts,
      totalPoints: placePts + elimPts,
    };
  };

  // Submit and Approve Results
  const handleSubmitResults = async (e) => {
    e.preventDefault();
    setSubmittingResults(true);
    setError('');
    try {
      const participantResults = resultsRows.map((r) => ({
        registrationId: r.registrationId,
        placement: Number(r.placement),
        eliminations: Number(r.eliminations),
      }));

      const payload = {
        participantResults,
        evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
        notes: resultsNotes || 'Official verification complete.',
      };

      await evoqService.submitMatchResult(resultsTargetMatch.id, payload);
      setSuccess('Match results approved and standings reconciled successfully!');
      setShowResultsModal(false);
      await loadRoundDetails(selectedRoundId);
      if (onRefreshTournament) onRefreshTournament();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit match results.');
    } finally {
      setSubmittingResults(false);
    }
  };

  // 6. View Group Standings
  const handleViewGroupStandings = async (group) => {
    setStandingsTitle(`${group.name} — Standings Table`);
    setLoadingStandings(true);
    setShowStandingsModal(true);
    try {
      const data = await evoqService.getGroupStandings(group.id);
      setStandingsRows(data.rows || []);
    } catch (err) {
      setError('Failed to fetch group standings.');
    } finally {
      setLoadingStandings(false);
    }
  };

  // View Round Overall Standings
  const handleViewRoundStandings = async () => {
    if (!selectedRoundId) return;
    setStandingsTitle(`${roundDetails?.name || 'Round'} — Cumulative Standings`);
    setLoadingStandings(true);
    setShowStandingsModal(true);
    try {
      const data = await evoqService.getRoundStandings(selectedRoundId);
      setStandingsRows(data.rows || []);
    } catch (err) {
      setError('Failed to fetch round standings.');
    } finally {
      setLoadingStandings(false);
    }
  };

  // 7. Qualify Teams Modal
  const handleOpenQualify = () => {
    setQualifyMethod('TOP_N');
    setAdvancePerGroup(2);
    setSelectedQualRegIds([]);
    setShowQualifyModal(true);
  };

  const handleCommitQualify = async () => {
    setQualifying(true);
    setError('');
    try {
      const payload = {
        method: qualifyMethod,
        advancePerGroup: Number(advancePerGroup),
        qualifiedRegistrationIds: qualifyMethod === 'MANUAL' ? selectedQualRegIds : undefined,
      };

      const result = await evoqService.qualifyTeams(selectedRoundId, payload);
      setSuccess(`${result.qualifiedCount} team(s) successfully qualified for progression.`);
      setShowQualifyModal(false);
      await loadRoundDetails(selectedRoundId);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to qualify teams.');
    } finally {
      setQualifying(false);
    }
  };

  // 8. Advance to Next Round
  const handleOpenAdvance = () => {
    const nextSeq = (roundDetails?.sequence || 1) + 1;
    setNextRoundName(`Round ${nextSeq}`);
    setNextRoundType(nextSeq === 2 ? 'FINALS' : 'GROUP');
    setShowAdvanceModal(true);
  };

  const handleCommitAdvance = async (e) => {
    e.preventDefault();
    setAdvancing(true);
    setError('');
    try {
      const result = await evoqService.advanceToNextRound(selectedRoundId, {
        roundName: nextRoundName,
        roundType: nextRoundType,
      });
      setSuccess(`Advanced to "${result.nextRound.name}"! Qualified teams locked into roster.`);
      setShowAdvanceModal(false);
      await loadRounds(result.nextRound.id);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to advance to next round. Ensure teams have been qualified.');
    } finally {
      setAdvancing(false);
    }
  };

  // 9. Delete Item (Round, Group, Match)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingItem(true);
    setError('');
    try {
      if (deleteTarget.type === 'ROUND') {
        await evoqService.deleteTournamentRound(deleteTarget.id);
        setSuccess(`Round "${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
        await loadRounds();
      } else if (deleteTarget.type === 'GROUP') {
        await evoqService.deleteCompetitionGroup(deleteTarget.id);
        setSuccess(`Group "${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
        await loadRoundDetails(selectedRoundId);
      } else if (deleteTarget.type === 'MATCH') {
        await evoqService.deleteMatch(deleteTarget.id);
        setSuccess(`Match #${deleteTarget.matchNumber || ''} deleted.`);
        setDeleteTarget(null);
        await loadRoundDetails(selectedRoundId);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete competition entity.');
    } finally {
      setDeletingItem(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="card" count={2} height="160px" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── ALERTS ── */}
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

      {/* ── ROUNDS PIPELINE NAVIGATION ── */}
      <div className="evoq-card" style={{ padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: rounds.length > 0 ? '16px' : '0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="trophy" size={18} color="#C9FF52" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Tournament Competition Rounds</h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--evoq-text-secondary)' }}>
              Manage tournament stages, lobbies, matches, and team qualification progression.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {roundDetails && (
              <SecondaryButton size="sm" icon="table" onClick={handleViewRoundStandings}>
                Round Standings
              </SecondaryButton>
            )}
            <PrimaryButton size="sm" icon="plus" onClick={() => setShowCreateRoundModal(true)}>
              Create Round
            </PrimaryButton>
          </div>
        </div>

        {rounds.length === 0 ? (
          <EmptyState
            icon="trophy"
            title="No Competition Rounds Created"
            description="Get started by creating Round 1 (e.g. Qualifiers or Group Stage) for this tournament."
            action={
              <PrimaryButton size="sm" icon="plus" onClick={() => setShowCreateRoundModal(true)}>
                Create Round 1
              </PrimaryButton>
            }
          />
        ) : (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {rounds.map((r) => {
              const isSelected = r.id === selectedRoundId;
              const groupCount = r.groups?.length || 0;
              const matchCount = r.matches?.length || 0;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectRound(r.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: isSelected ? '1px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                    backgroundColor: isSelected ? '#141c12' : 'var(--evoq-surface)',
                    color: 'var(--evoq-text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    minWidth: '180px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--evoq-font-mono)',
                        fontWeight: 700,
                        color: isSelected ? 'var(--evoq-lime)' : 'var(--evoq-text-secondary)',
                      }}
                    >
                      ROUND {r.sequence}
                    </span>
                    <StatusIndicator status={r.status} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-secondary)', marginTop: '2px' }}>
                    {groupCount} Group{groupCount !== 1 ? 's' : ''} • {matchCount} Match{matchCount !== 1 ? 'es' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SELECTED ROUND WORKSPACE ── */}
      {selectedRoundId && roundDetails && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Round Header Bar */}
          <div
            className="evoq-card"
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: '#10130F',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge variant="lime">ROUND {roundDetails.sequence}</Badge>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{roundDetails.name}</h2>
              <StatusIndicator status={roundDetails.status} />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <SecondaryButton size="sm" icon="users" onClick={handleOpenCreateGroups}>
                {roundDetails.groups?.length === 0 ? 'Create Groups & Allocate' : 'Add Groups / Allocate'}
              </SecondaryButton>
              <SecondaryButton size="sm" icon="check" onClick={handleOpenQualify}>
                Qualify Teams
              </SecondaryButton>
              <PrimaryButton size="sm" icon="arrow-right" onClick={handleOpenAdvance}>
                Advance to Next Round
              </PrimaryButton>
              <SecondaryButton
                variant="danger"
                size="sm"
                icon="trash"
                onClick={() => setDeleteTarget({ type: 'ROUND', id: roundDetails.id, name: roundDetails.name })}
              >
                Delete Round
              </SecondaryButton>
            </div>
          </div>

          {/* Groups Grid */}
          {loadingDetails ? (
            <SkeletonLoader type="card" count={2} height="200px" />
          ) : !roundDetails.groups || roundDetails.groups.length === 0 ? (
            <div className="evoq-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
              <Icon name="users" size={32} color="#C9FF52" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>No Competition Groups in this Round</h4>
              <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', margin: '0 0 18px 0' }}>
                Allocate registered teams into groups (e.g. Group A, Group B) to create lobby fixtures and run matches.
              </p>
              <PrimaryButton size="sm" icon="plus" onClick={handleOpenCreateGroups}>
                Create Groups &amp; Allocate Teams
              </PrimaryButton>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
              {roundDetails.groups.map((group) => {
                const snapshot = group.standingSnapshots?.[0];
                const allocatedRows = snapshot?.rows || [];
                const matches = group.matches || [];

                return (
                  <div
                    key={group.id}
                    className="evoq-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      border: '1px solid var(--evoq-border)',
                      backgroundColor: 'var(--evoq-surface)',
                    }}
                  >
                    {/* Group Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--evoq-lime)' }}>
                          {group.name}
                        </span>
                        <Badge variant="neutral">{allocatedRows.length} Teams</Badge>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <SecondaryButton size="sm" icon="table" onClick={() => handleViewGroupStandings(group)}>
                          Standings
                        </SecondaryButton>
                        <SecondaryButton
                          size="sm"
                          icon="plus"
                          onClick={() => handleOpenCreateMatches(group.id)}
                        >
                          Add Matches
                        </SecondaryButton>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'GROUP', id: group.id, name: group.name })}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--evoq-text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Delete Group"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Allocated Teams Chip List */}
                    <div>
                      <span className="evoq-mono-label" style={{ marginBottom: '6px', display: 'block' }}>
                        ALLOCATED TEAMS ({allocatedRows.length})
                      </span>
                      {allocatedRows.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--evoq-text-secondary)' }}>
                          No teams assigned yet.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {allocatedRows.map((r, i) => {
                            const team = r.registration?.team;
                            const profile = r.registration?.gamerProfile;
                            const name = team?.name || profile?.displayName || `Team ${i + 1}`;
                            const avatar = team?.logoUrl || profile?.avatarUrl;

                            return (
                              <div
                                key={r.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 8px',
                                  backgroundColor: 'var(--evoq-surface-elevated)',
                                  borderRadius: 'var(--evoq-radius-sm)',
                                  border: '1px solid var(--evoq-border-subtle)',
                                  fontSize: '0.8rem',
                                }}
                              >
                                <Avatar src={avatar} name={name} size={18} />
                                <span style={{ fontWeight: 600 }}>{name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Matches Section */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <span className="evoq-mono-label">GROUP MATCHES ({matches.length})</span>
                      </div>

                      {matches.length === 0 ? (
                        <div
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--evoq-surface-elevated)',
                            borderRadius: 'var(--evoq-radius-sm)',
                            textAlign: 'center',
                          }}
                        >
                          <p style={{ margin: '0 0 10px 0', fontSize: '0.84rem', color: 'var(--evoq-text-secondary)' }}>
                            No matches scheduled for this group.
                          </p>
                          <PrimaryButton size="sm" icon="plus" onClick={() => handleOpenCreateMatches(group.id)}>
                            Create Group Matches
                          </PrimaryButton>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {matches.map((m) => {
                            const isCompleted = m.status === 'COMPLETED';
                            const hasCreds = Boolean(m.credential?.roomId);
                            const credsReleased = Boolean(m.credential?.isReleased);

                            return (
                              <div
                                key={m.id}
                                style={{
                                  padding: '10px 14px',
                                  backgroundColor: 'var(--evoq-surface-elevated)',
                                  borderRadius: 'var(--evoq-radius-sm)',
                                  border: isCompleted
                                    ? '1px solid rgba(201, 255, 82, 0.3)'
                                    : '1px solid var(--evoq-border)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '8px',
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                      {m.title || `Match #${m.matchNumber}`}
                                    </span>
                                    <StatusIndicator status={m.status} />
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.78rem' }}>
                                    <span style={{ color: 'var(--evoq-text-secondary)' }}>
                                      {m.participants?.length || allocatedRows.length} Competitors
                                    </span>
                                    {hasCreds && (
                                      <Badge variant={credsReleased ? 'lime' : 'neutral'}>
                                        {credsReleased ? 'ROOM RELEASED' : 'ROOM DRAFT'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <SecondaryButton size="sm" icon="shield" onClick={() => handleOpenCredentials(m)}>
                                    Credentials
                                  </SecondaryButton>
                                  <PrimaryButton
                                    size="sm"
                                    icon="check"
                                    onClick={() => handleOpenEnterResults(m)}
                                  >
                                    {isCompleted ? 'Edit Results' : 'Enter Results'}
                                  </PrimaryButton>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: 'MATCH',
                                        id: m.id,
                                        matchNumber: m.matchNumber,
                                        name: m.title || `Match #${m.matchNumber}`,
                                      })
                                    }
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--evoq-text-secondary)',
                                      cursor: 'pointer',
                                      padding: '4px',
                                    }}
                                    title="Delete Match"
                                  >
                                    <Icon name="trash" size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: CREATE ROUND ── */}
      <Modal
        isOpen={showCreateRoundModal}
        onClose={() => setShowCreateRoundModal(false)}
        title="Create Competition Round"
        subtitle="Provision a new tournament stage round (e.g. Qualifiers, Quarter Finals, Finals)"
        maxWidth="460px"
      >
        <form onSubmit={handleCreateRound} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Round Name"
              id="roundName"
              placeholder="e.g. Round 1 - Qualifiers"
              value={newRoundForm.name}
              onChange={(e) => setNewRoundForm({ ...newRoundForm, name: e.target.value })}
              required
            />

            <Select
              label="Round Type"
              id="roundType"
              value={newRoundForm.roundType}
              onChange={(e) => setNewRoundForm({ ...newRoundForm, roundType: e.target.value })}
            >
              <option value="GROUP">Group Stage / Battle Royale</option>
              <option value="FINALS">Grand Finals</option>
              <option value="UPPER">Upper Bracket</option>
              <option value="LOWER">Lower Bracket</option>
            </Select>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <SecondaryButton onClick={() => setShowCreateRoundModal(false)} disabled={creatingRound}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={creatingRound} disabled={creatingRound || !newRoundForm.name.trim()}>
                Create Round
              </PrimaryButton>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 2: CREATE GROUPS & ALLOCATE TEAMS ── */}
      <Modal
        isOpen={showCreateGroupsModal}
        onClose={() => setShowCreateGroupsModal(false)}
        title="Create Groups &amp; Allocate Teams"
        subtitle={`Distribute eligible teams for ${roundDetails?.name || 'this round'}`}
        maxWidth="680px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--evoq-border)', paddingBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setAllocationMode('MANUAL')}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--evoq-radius-sm)',
                border: allocationMode === 'MANUAL' ? '1px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                backgroundColor: allocationMode === 'MANUAL' ? '#141c12' : 'var(--evoq-surface)',
                color: allocationMode === 'MANUAL' ? 'var(--evoq-lime)' : 'var(--evoq-text-primary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              Manual Allocation
            </button>
            <button
              type="button"
              onClick={() => setAllocationMode('RANDOM')}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--evoq-radius-sm)',
                border: allocationMode === 'RANDOM' ? '1px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                backgroundColor: allocationMode === 'RANDOM' ? '#141c12' : 'var(--evoq-surface)',
                color: allocationMode === 'RANDOM' ? 'var(--evoq-lime)' : 'var(--evoq-text-primary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              Random Allocation Preview
            </button>
          </div>

          {/* Allocation Body */}
          {allocationMode === 'MANUAL' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="evoq-mono-label">CONFIGURED GROUPS ({manualGroups.length})</span>
                  <Badge variant={eligibleData?.teams?.filter((t) => !manualGroups.some((g) => g.registrationIds.includes(t.id)) && !t.isAllocated).length > 0 ? 'neutral' : 'lime'}>
                    Unassigned: {eligibleData?.teams?.filter((t) => !manualGroups.some((g) => g.registrationIds.includes(t.id)) && !t.isAllocated).length || 0} Teams
                  </Badge>
                </div>
                <SecondaryButton size="sm" icon="plus" onClick={handleAddManualGroup}>
                  Add Another Group
                </SecondaryButton>
              </div>

              {/* Group Configuration Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {manualGroups.map((g, gIdx) => {
                  const isFull = g.capacity && g.registrationIds.length >= g.capacity;

                  return (
                    <div
                      key={gIdx}
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--evoq-surface-elevated)',
                        borderRadius: 'var(--evoq-radius-sm)',
                        border: isFull ? '1px solid rgba(201, 255, 82, 0.4)' : '1px solid var(--evoq-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={g.name}
                          onChange={(e) => {
                            const updated = [...manualGroups];
                            updated[gIdx].name = e.target.value;
                            setManualGroups(updated);
                          }}
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--evoq-lime)',
                            outline: 'none',
                            width: '120px',
                          }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--evoq-text-secondary)', textTransform: 'uppercase' }}>Cap:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={g.capacity || 4}
                              onChange={(e) => handleManualGroupCapacityChange(gIdx, e.target.value)}
                              style={{
                                width: '48px',
                                padding: '2px 4px',
                                backgroundColor: 'var(--evoq-surface)',
                                border: '1px solid var(--evoq-border)',
                                borderRadius: '4px',
                                color: 'var(--evoq-text-primary)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textAlign: 'center',
                              }}
                            />
                          </div>

                          {manualGroups.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveManualGroup(gIdx)}
                              style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '2px' }}
                              title="Remove Group"
                            >
                              <Icon name="x" size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--evoq-text-secondary)' }}>
                          {g.registrationIds.length} / {g.capacity || '∞'} Teams Allocated
                        </span>
                        {isFull && <Badge variant="lime">FULL</Badge>}
                        {g.registrationIds.length === 0 && <Badge variant="neutral">EMPTY</Badge>}
                      </div>

                      {/* Selectable Teams List */}
                      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {eligibleData?.teams?.map((team) => {
                          const isAssignedToThis = g.registrationIds.includes(team.id);
                          const isAssignedElsewhere =
                            manualGroups.some((otherG, otherIdx) => otherIdx !== gIdx && otherG.registrationIds.includes(team.id)) ||
                            (team.isAllocated && !isAssignedToThis);

                          const isBlockedByCapacity = !isAssignedToThis && isFull;
                          const isDisabled = isAssignedElsewhere || isBlockedByCapacity;
                          const name = team.team?.name || team.gamerProfile?.displayName || 'Team';

                          return (
                            <label
                              key={team.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                borderRadius: 'var(--evoq-radius-sm)',
                                backgroundColor: isAssignedToThis ? '#192415' : 'var(--evoq-surface)',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.35 : 1,
                                fontSize: '0.8rem',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isAssignedToThis}
                                disabled={isDisabled}
                                onChange={() => handleToggleTeamInGroup(gIdx, team.id)}
                              />
                              <span style={{ fontWeight: isAssignedToThis ? 700 : 500, flex: 1 }}>{name}</span>
                              {isBlockedByCapacity && (
                                <span style={{ fontSize: '0.7rem', color: '#ff6b6b' }}>Full</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* RANDOM ALLOCATION MODE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                <Select
                  label="Number of Groups"
                  id="randomGroupCount"
                  value={randomGroupCount}
                  onChange={(e) => setRandomGroupCount(Number(e.target.value))}
                >
                  <option value={1}>1 Group (Single Group Round)</option>
                  <option value={2}>2 Groups (Group A &amp; Group B)</option>
                  <option value={3}>3 Groups (A, B, C)</option>
                  <option value={4}>4 Groups (A, B, C, D)</option>
                  <option value={5}>5 Groups (A to E)</option>
                  <option value={6}>6 Groups (A to F)</option>
                  <option value={8}>8 Groups (A to H)</option>
                </Select>

                <Input
                  label="Capacity per Group (Optional)"
                  id="randomCapacityInput"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Auto-calculated"
                  value={randomGroupCapacity}
                  onChange={(e) => setRandomGroupCapacity(e.target.value)}
                  helperText="Leave blank to fill groups evenly."
                />

                <div style={{ paddingBottom: '2px' }}>
                  <SecondaryButton icon="refresh" onClick={handleRandomizePreview}>
                    {randomPreview ? 'Re-randomize Preview' : 'Generate Preview'}
                  </SecondaryButton>
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#131910', borderRadius: 'var(--evoq-radius-sm)', border: '1px solid var(--evoq-border-accent)', fontSize: '0.8rem', color: 'var(--evoq-text-secondary)' }}>
                Sequential Allocation: Teams are randomized first, then fill Group A up to capacity, then Group B up to capacity, etc. Empty groups are allowed.
              </div>

              {randomPreview && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {randomPreview.map((grp, i) => {
                      const isFull = grp.registrationIds.length >= (grp.capacity || 0);
                      const isEmpty = grp.registrationIds.length === 0;

                      return (
                        <div
                          key={i}
                          style={{
                            padding: '12px',
                            backgroundColor: 'var(--evoq-surface-elevated)',
                            borderRadius: 'var(--evoq-radius-sm)',
                            border: isFull ? '1px solid rgba(201, 255, 82, 0.4)' : '1px solid var(--evoq-border)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--evoq-lime)' }}>{grp.name}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <Badge variant="neutral">{grp.registrationIds.length} / {grp.capacity || '∞'}</Badge>
                              {isFull && <Badge variant="lime">FULL</Badge>}
                              {isEmpty && <Badge variant="neutral">EMPTY</Badge>}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--evoq-text-secondary)' }}>
                            {isEmpty ? (
                              <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No teams allocated (Empty Group)</span>
                            ) : (
                              grp.registrationIds.map((regId) => {
                                const t = eligibleData?.teams?.find((item) => item.id === regId);
                                return (
                                  <div key={regId} style={{ padding: '2px 0' }}>
                                    • {t?.team?.name || t?.gamerProfile?.displayName || regId.slice(0, 8)}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {randomUnassigned.length > 0 && (
                    <div className="evoq-alert evoq-alert-danger" style={{ margin: 0 }}>
                      <Icon name="x" size={16} />
                      <div>
                        <strong>{randomUnassigned.length} Team(s) Unassigned</strong>: Configured total capacity ({randomPreview.length} groups × {randomEffectiveCap} capacity) cannot fit all eligible teams. Increase group count or capacity.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <SecondaryButton onClick={() => setShowCreateGroupsModal(false)} disabled={submittingGroups}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleCommitGroups} loading={submittingGroups} disabled={submittingGroups}>
              Commit Group Allocation
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* ── MODAL 3: CREATE MATCHES ── */}
      <Modal
        isOpen={showCreateMatchesModal}
        onClose={() => setShowCreateMatchesModal(false)}
        title="Create Group Matches"
        subtitle="Generate Battle Royale lobby matches automatically fixturing all assigned group teams"
        maxWidth="440px"
      >
        <form onSubmit={handleCreateMatches} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Match Count"
              id="matchCountInput"
              type="number"
              min="1"
              max="20"
              value={matchCount}
              onChange={(e) => setMatchCount(e.target.value)}
              required
            />
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', lineHeight: 1.4 }}>
              Creating {matchCount} match(es) will add all allocated teams in this group as participants into each lobby.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <SecondaryButton onClick={() => setShowCreateMatchesModal(false)} disabled={creatingMatches}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={creatingMatches} disabled={creatingMatches}>
                Create Matches
              </PrimaryButton>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 4: ROOM CREDENTIALS ── */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        title="Match Room &amp; Lobby Credentials"
        subtitle={selectedMatch ? selectedMatch.title || `Match #${selectedMatch.matchNumber}` : ''}
        maxWidth="500px"
      >
        <form onSubmit={handleSaveCredentials} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SecondaryButton
                size="sm"
                icon="copy"
                onClick={handleCopyPreviousCredentials}
                loading={copyingCredentials}
                disabled={copyingCredentials}
              >
                Use Same Credentials as Previous Match
              </SecondaryButton>
            </div>

            <Input
              label="Room ID / Lobby Name"
              id="roomId"
              placeholder="e.g. ROOM-89214"
              value={credForm.roomId}
              onChange={(e) => setCredForm({ ...credForm, roomId: e.target.value })}
              required
            />

            <Input
              label="Room Password / PIN"
              id="roomPassword"
              placeholder="e.g. EVOQ99"
              value={credForm.roomPassword}
              onChange={(e) => setCredForm({ ...credForm, roomPassword: e.target.value })}
              required
            />

            <Input
              label="Server Region / Details (Optional)"
              id="lobbyDetails"
              placeholder="e.g. Singapore Server • Standard Map"
              value={credForm.lobbyDetails}
              onChange={(e) => setCredForm({ ...credForm, lobbyDetails: e.target.value })}
            />

            <Input
              label="Access Instructions (Optional)"
              id="accessInstructions"
              placeholder="e.g. Join the slot corresponding to your assigned seed."
              value={credForm.accessInstructions}
              onChange={(e) => setCredForm({ ...credForm, accessInstructions: e.target.value })}
            />

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: credForm.isReleased ? '#152412' : 'var(--evoq-surface-elevated)',
                borderRadius: 'var(--evoq-radius-sm)',
                border: credForm.isReleased ? '1px solid var(--evoq-lime)' : '1px solid var(--evoq-border)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={credForm.isReleased}
                onChange={(e) => setCredForm({ ...credForm, isReleased: e.target.checked })}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: credForm.isReleased ? 'var(--evoq-lime)' : 'var(--evoq-text-primary)' }}>
                  Release Credentials to Competitors
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-secondary)' }}>
                  When released, participating gamers will instantly see the room details and credentials on their dashboard.
                </div>
              </div>
            </label>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <SecondaryButton onClick={() => setShowCredentialsModal(false)} disabled={savingCredentials}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                loading={savingCredentials}
                disabled={savingCredentials || !credForm.roomId.trim() || !credForm.roomPassword.trim()}
              >
                Save Room Credentials
              </PrimaryButton>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 5: ENTER MATCH RESULTS & EVIDENCE ── */}
      <Modal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        title="Enter Match Results &amp; Scoring"
        subtitle={resultsTargetMatch ? resultsTargetMatch.title || `Match #${resultsTargetMatch.matchNumber}` : ''}
        maxWidth="740px"
      >
        <form onSubmit={handleSubmitResults} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Screenshot Evidence Upload */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--evoq-surface-elevated)',
                borderRadius: 'var(--evoq-radius-sm)',
                border: '1px solid var(--evoq-border)',
              }}
            >
              <span className="evoq-mono-label" style={{ marginBottom: '8px', display: 'block' }}>
                MATCH SCREENSHOT PROOF / EVIDENCE
              </span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleEvidenceFileChange}
                  style={{ fontSize: '0.84rem' }}
                />
                {uploadingEvidence && <span style={{ fontSize: '0.82rem', color: 'var(--evoq-lime)' }}>Uploading...</span>}
              </div>

              {evidencePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={evidencePreview}
                    alt="Match proof preview"
                    style={{ maxHeight: '140px', borderRadius: '4px', border: '1px solid var(--evoq-border)' }}
                  />
                </div>
              )}
            </div>

            {/* Participants Results Table */}
            <div>
              <span className="evoq-mono-label" style={{ marginBottom: '8px', display: 'block' }}>
                PARTICIPANT SCORES &amp; POINTS PREVIEW
              </span>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--evoq-border)', textAlign: 'left', color: 'var(--evoq-text-secondary)' }}>
                      <th style={{ padding: '8px' }}>Competitor / Team</th>
                      <th style={{ padding: '8px', width: '110px' }}>Placement (Rank)</th>
                      <th style={{ padding: '8px', width: '110px' }}>Kills / Eliminations</th>
                      <th style={{ padding: '8px', width: '120px', textAlign: 'right' }}>Calculated Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsRows.map((row, idx) => {
                      const pts = calculatePointsPreview(row.placement, row.eliminations);

                      return (
                        <tr key={row.registrationId} style={{ borderBottom: '1px solid var(--evoq-border-subtle)' }}>
                          <td style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Avatar src={row.logoUrl} name={row.teamName} size={20} />
                              <span style={{ fontWeight: 600 }}>{row.teamName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={row.placement}
                              onChange={(e) => handleResultRowChange(idx, 'placement', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '4px 8px',
                                backgroundColor: 'var(--evoq-surface)',
                                border: '1px solid var(--evoq-border)',
                                borderRadius: '4px',
                                color: 'var(--evoq-text-primary)',
                                fontWeight: 700,
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={row.eliminations}
                              onChange={(e) => handleResultRowChange(idx, 'eliminations', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '4px 8px',
                                backgroundColor: 'var(--evoq-surface)',
                                border: '1px solid var(--evoq-border)',
                                borderRadius: '4px',
                                color: 'var(--evoq-text-primary)',
                                fontWeight: 700,
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 800, color: 'var(--evoq-lime)', fontFamily: 'var(--evoq-font-mono)' }}>
                              {pts.totalPoints} PTS
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--evoq-text-secondary)' }}>
                              ({pts.placementPoints} place + {pts.eliminationPoints} elims)
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <Input
              label="Review Notes / Verification Signature"
              id="resultsNotes"
              placeholder="e.g. Official referee verification complete."
              value={resultsNotes}
              onChange={(e) => setResultsNotes(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <SecondaryButton onClick={() => setShowResultsModal(false)} disabled={submittingResults}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={submittingResults} disabled={submittingResults}>
                Save &amp; Approve Match Results
              </PrimaryButton>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 6: STANDINGS TABLE ── */}
      <Modal
        isOpen={showStandingsModal}
        onClose={() => setShowStandingsModal(false)}
        title={standingsTitle}
        subtitle="Cumulative Battle Royale points breakdown computed with tournament scoring rules"
        maxWidth="680px"
      >
        <div>
          {loadingStandings ? (
            <SkeletonLoader type="card" count={2} height="120px" />
          ) : standingsRows.length === 0 ? (
            <EmptyState icon="table" title="No Matches Completed" description="Standings will populate as match results are approved." />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'rank',
                  header: 'Rank',
                  render: (val, _, idx) => (
                    <span style={{ fontWeight: 800, color: idx === 0 ? 'var(--evoq-lime)' : 'var(--evoq-text-primary)' }}>
                      #{val || idx + 1}
                    </span>
                  ),
                },
                {
                  key: 'team',
                  header: 'Competitor / Team',
                  render: (_, row) => {
                    const team = row.registration?.team;
                    const profile = row.registration?.gamerProfile;
                    const name = team?.name || profile?.displayName || 'Team';
                    const avatar = team?.logoUrl || profile?.avatarUrl;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar src={avatar} name={name} size={20} />
                        <span style={{ fontWeight: 700 }}>{name}</span>
                      </div>
                    );
                  },
                },
                { key: 'played', header: 'Matches', render: (val) => val ?? 0 },
                { key: 'wins', header: 'Wins', render: (val) => val ?? 0 },
                {
                  key: 'eliminations',
                  header: 'Elims',
                  render: (_, row) => row.metrics?.eliminations ?? 0,
                },
                {
                  key: 'placementPoints',
                  header: 'Place Pts',
                  render: (_, row) => row.metrics?.placementPoints ?? 0,
                },
                {
                  key: 'points',
                  header: 'Total Points',
                  render: (val) => (
                    <span style={{ fontWeight: 800, color: 'var(--evoq-lime)', fontFamily: 'var(--evoq-font-mono)' }}>
                      {val ?? 0}
                    </span>
                  ),
                },
              ]}
              data={standingsRows}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <SecondaryButton onClick={() => setShowStandingsModal(false)}>Close</SecondaryButton>
          </div>
        </div>
      </Modal>

      {/* ── MODAL 7: QUALIFY TEAMS ── */}
      <Modal
        isOpen={showQualifyModal}
        onClose={() => setShowQualifyModal(false)}
        title="Qualify Teams for Progression"
        subtitle={`Select which teams advance from ${roundDetails?.name || 'this round'}`}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Qualification Method"
            id="qualMethod"
            value={qualifyMethod}
            onChange={(e) => setQualifyMethod(e.target.value)}
          >
            <option value="TOP_N">Top N Teams Per Group</option>
            <option value="MANUAL">Manual Team Selection</option>
          </Select>

          {qualifyMethod === 'TOP_N' ? (
            <Input
              label="Advance Per Group"
              id="advancePerGroupInput"
              type="number"
              min="1"
              max="20"
              value={advancePerGroup}
              onChange={(e) => setAdvancePerGroup(e.target.value)}
              helperText={`Top ${advancePerGroup} team(s) from each group's cumulative standings will be qualified.`}
            />
          ) : (
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--evoq-text-secondary)' }}>
              All current round teams will be evaluated based on organizer discretion.
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <SecondaryButton onClick={() => setShowQualifyModal(false)} disabled={qualifying}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleCommitQualify} loading={qualifying} disabled={qualifying}>
              Confirm Qualification
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* ── MODAL 8: ADVANCE TO NEXT ROUND ── */}
      <Modal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        title="Advance to Next Round"
        subtitle="Complete the current round and provision Round N+1 locking qualified teams as the eligible pool"
        maxWidth="460px"
      >
        <form onSubmit={handleCommitAdvance} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Next Round Name"
              id="nextRoundName"
              placeholder="e.g. Round 2 - Grand Finals"
              value={nextRoundName}
              onChange={(e) => setNextRoundName(e.target.value)}
              required
            />

            <Select
              label="Next Round Type"
              id="nextRoundType"
              value={nextRoundType}
              onChange={(e) => setNextRoundType(e.target.value)}
            >
              <option value="GROUP">Group Stage</option>
              <option value="FINALS">Grand Finals</option>
            </Select>

            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', lineHeight: 1.4 }}>
              Advancing completes this round. Only the teams qualified in the previous step will be eligible for group allocation in the new round.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <SecondaryButton onClick={() => setShowAdvanceModal(false)} disabled={advancing}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={advancing} disabled={advancing || !nextRoundName.trim()}>
                Create Next Round
              </PrimaryButton>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 9: DELETE CONFIRMATION ── */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.type || 'Entity'}`}
        subtitle={`Permanent removal of ${deleteTarget?.name || 'this item'}`}
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--evoq-text-secondary)' }}>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? Any child matches, results, and records will be removed.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <SecondaryButton onClick={() => setDeleteTarget(null)} disabled={deletingItem}>
              Cancel
            </SecondaryButton>
            <PrimaryButton variant="danger" icon="trash" onClick={handleConfirmDelete} loading={deletingItem} disabled={deletingItem}>
              Permanently Delete
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

