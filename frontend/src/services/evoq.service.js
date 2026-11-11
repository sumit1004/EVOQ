import api from './api.js';

export const evoqService = {
  // ── Games ──
  async getGames(params = {}) {
    const res = await api.get('/games', { params });
    return res.data.data;
  },

  async getGameBySlug(slug) {
    const res = await api.get(`/games/${slug}`);
    return res.data.data;
  },

  // ── Gamer Profiles ──
  async getMyProfile() {
    const res = await api.get('/profiles/me');
    return res.data.data;
  },

  async updateMyProfile(data) {
    const res = await api.post('/profiles/me', data);
    return res.data.data;
  },

  async addGameIdentity(data) {
    const res = await api.post('/profiles/me/identities', data);
    return res.data.data;
  },

  async removeGameIdentity(gameId) {
    await api.delete(`/profiles/me/identities/${gameId}`);
  },

  async getPublicProfile(slug) {
    const res = await api.get(`/profiles/${slug}`);
    return res.data.data;
  },

  async lookupGamerByEvoqId(evoqId) {
    const res = await api.get(`/profiles/lookup/evoq/${encodeURIComponent(evoqId)}`);
    return res.data.data;
  },

  // ── Teams ──
  async getTeams(params = {}) {
    const res = await api.get('/teams', { params });
    return res.data.data;
  },

  async getMyTeams() {
    const res = await api.get('/teams/my/list');
    return res.data.data;
  },

  async createTeam(data) {
    const res = await api.post('/teams', data);
    return res.data.data;
  },

  async getTeamBySlug(slug) {
    const res = await api.get(`/teams/${slug}`);
    return res.data.data;
  },

  async updateTeam(id, data) {
    const res = await api.patch(`/teams/${id}`, data);
    return res.data.data;
  },

  async inviteTeamMember(teamId, data) {
    const res = await api.post(`/teams/${teamId}/invitations`, data);
    return res.data.data;
  },

  async getMyInvitations() {
    const res = await api.get('/teams/my/invitations');
    return res.data.data;
  },

  async respondInvitation(invitationId, action) {
    const res = await api.post(`/teams/invitations/${invitationId}/respond`, { action });
    return res.data.data;
  },

  async removeTeamMember(teamId, userId) {
    const res = await api.delete(`/teams/${teamId}/members/${userId}`);
    return res.data.data;
  },

  // ── Organizations ──
  async getOrganizations() {
    const res = await api.get('/organizations');
    return res.data.data;
  },

  async getMyOrganizations() {
    const res = await api.get('/organizations/my/list');
    return res.data.data;
  },

  async createOrganization(data) {
    const res = await api.post('/organizations', data);
    return res.data.data;
  },

  async getOrganizationBySlug(slug) {
    const res = await api.get(`/organizations/${slug}`);
    return res.data.data;
  },

  async updateOrganization(id, data) {
    const res = await api.patch(`/organizations/${id}`, data);
    return res.data.data;
  },

  async addOrgStaff(orgId, data) {
    const res = await api.post(`/organizations/${orgId}/staff`, data);
    return res.data.data;
  },

  async removeOrgStaff(orgId, userId) {
    const res = await api.delete(`/organizations/${orgId}/staff/${userId}`);
    return res.data.data;
  },

  // ── Organizers ──
  async getMyOrganizerProfile() {
    const res = await api.get('/organizers/me');
    return res.data.data;
  },

  async updateOrganizerProfile(data) {
    const res = await api.post('/organizers/me', data);
    return res.data.data;
  },

  async getPublicOrganizer(slug) {
    const res = await api.get(`/organizers/${slug}`);
    return res.data.data;
  },

  // ── Tournaments ──
  async getTournaments(params = {}) {
    const res = await api.get('/tournaments', { params });
    return res.data;
  },

  async getTournamentBySlug(slug) {
    const res = await api.get(`/tournaments/${slug}`);
    return res.data.data;
  },

  async createTournament(data) {
    const res = await api.post('/tournaments', data);
    return res.data.data;
  },

  async updateTournament(id, data) {
    const res = await api.patch(`/tournaments/${id}`, data);
    return res.data.data;
  },

  async updateTournamentStatus(id, status) {
    const res = await api.post(`/tournaments/${id}/status`, { status });
    return res.data.data;
  },

  async getOrganizerDashboard() {
    const res = await api.get('/tournaments/organizer/dashboard');
    return res.data.data;
  },

  // ── Registrations ──
  async getEligibleTeamsForTournament(tournamentId) {
    const res = await api.get(`/tournaments/${tournamentId}/registrations/eligible-teams`);
    return res.data.data;
  },

  async registerTournament(tournamentId, data) {
    const res = await api.post(`/tournaments/${tournamentId}/registrations`, data);
    return res.data.data;
  },

  async getRegistrations(tournamentId, status = '') {
    const res = await api.get(`/tournaments/${tournamentId}/registrations`, {
      params: status ? { status } : {},
    });
    return res.data.data;
  },

  async updateRegistrationStatus(tournamentId, regId, data) {
    const res = await api.patch(`/tournaments/${tournamentId}/registrations/${regId}/status`, data);
    return res.data.data;
  },

  async withdrawRegistration(tournamentId) {
    const res = await api.post(`/tournaments/${tournamentId}/registrations/withdraw`);
    return res.data.data;
  },

  // ── Competition & Matches ──
  async getStages(tournamentId) {
    const res = await api.get(`/tournaments/${tournamentId}/stages`);
    return res.data.data;
  },

  async getMatches(tournamentId) {
    const res = await api.get(`/tournaments/${tournamentId}/matches`);
    return res.data.data;
  },

  async getMatch(matchId) {
    const res = await api.get(`/matches/${matchId}`);
    return res.data.data;
  },

  async generateMatches(tournamentId, data = {}) {
    const res = await api.post(`/tournaments/${tournamentId}/generate-matches`, data);
    return res.data.data;
  },

  async scheduleMatch(matchId, data) {
    const res = await api.patch(`/matches/${matchId}/schedule`, data);
    return res.data.data;
  },

  async setMatchCredentials(matchId, data) {
    const res = await api.post(`/matches/${matchId}/credentials`, data);
    return res.data.data;
  },

  async getMatchCredentials(matchId) {
    const res = await api.get(`/matches/${matchId}/credentials`);
    return res.data.data;
  },

  // ── Results & Standings ──
  async submitMatchResult(matchId, data) {
    const res = await api.post(`/matches/${matchId}/results`, data);
    return res.data.data;
  },

  async approveMatchResult(resultId) {
    const res = await api.post(`/results/${resultId}/approve`);
    return res.data.data;
  },

  async rejectMatchResult(resultId, data) {
    const res = await api.post(`/results/${resultId}/reject`, data);
    return res.data.data;
  },

  async getStandings(tournamentId) {
    const res = await api.get(`/tournaments/${tournamentId}/standings`);
    return res.data.data;
  },

  // ── Notifications ──
  async getNotifications(page = 1) {
    const res = await api.get('/notifications', { params: { page } });
    return res.data.data;
  },

  async markNotificationRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllNotificationsRead() {
    const res = await api.post('/notifications/read-all');
    return res.data.data;
  },

  // ── Media ──
  async uploadMedia(dataUri, fileName = 'asset') {
    const res = await api.post('/media/upload', { dataUri, fileName });
    return res.data.data;
  },
};

