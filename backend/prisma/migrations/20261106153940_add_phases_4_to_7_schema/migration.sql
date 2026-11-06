-- CreateTable
CREATE TABLE `games` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `slug` VARCHAR(128) NOT NULL,
    `shortName` VARCHAR(32) NULL,
    `genre` VARCHAR(64) NULL,
    `publisher` VARCHAR(128) NULL,
    `logoUrl` VARCHAR(512) NULL,
    `bannerUrl` VARCHAR(512) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    `platforms` JSON NULL,
    `supportedRoles` JSON NULL,
    `identityFields` JSON NULL,
    `scoringTemplate` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `games_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gamer_profiles` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `slug` VARCHAR(64) NOT NULL,
    `displayName` VARCHAR(128) NOT NULL,
    `inGameName` VARCHAR(128) NULL,
    `bio` TEXT NULL,
    `avatarUrl` VARCHAR(512) NULL,
    `coverUrl` VARCHAR(512) NULL,
    `country` VARCHAR(64) NULL,
    `state` VARCHAR(64) NULL,
    `city` VARCHAR(64) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gamerType` VARCHAR(32) NULL DEFAULT 'COMPETITIVE',
    `primaryGameId` CHAR(36) NULL,
    `socialLinks` JSON NULL,
    `website` VARCHAR(255) NULL,
    `visibility` VARCHAR(32) NOT NULL DEFAULT 'PUBLIC',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gamer_profiles_userId_key`(`userId`),
    UNIQUE INDEX `gamer_profiles_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gamer_game_identities` (
    `id` CHAR(36) NOT NULL,
    `profileId` CHAR(36) NOT NULL,
    `gameId` CHAR(36) NOT NULL,
    `inGameName` VARCHAR(128) NOT NULL,
    `inGameUid` VARCHAR(128) NULL,
    `serverRegion` VARCHAR(64) NULL,
    `competitiveRole` VARCHAR(64) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `verificationStatus` VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    `verificationMethod` VARCHAR(64) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gamer_game_identities_profileId_gameId_key`(`profileId`, `gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `slug` VARCHAR(128) NOT NULL,
    `logoUrl` VARCHAR(512) NULL,
    `coverUrl` VARCHAR(512) NULL,
    `description` TEXT NULL,
    `primaryGameId` CHAR(36) NULL,
    `country` VARCHAR(64) NULL,
    `region` VARCHAR(64) NULL,
    `ownerId` CHAR(36) NOT NULL,
    `captainId` CHAR(36) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teams_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_memberships` (
    `id` CHAR(36) NOT NULL,
    `teamId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'PLAYER',
    `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,

    UNIQUE INDEX `team_memberships_teamId_userId_key`(`teamId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_invitations` (
    `id` CHAR(36) NOT NULL,
    `teamId` CHAR(36) NOT NULL,
    `inviterId` CHAR(36) NOT NULL,
    `inviteeId` CHAR(36) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'PLAYER',
    `tokenHash` VARCHAR(255) NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `team_invitations_tokenHash_key`(`tokenHash`),
    INDEX `team_invitations_inviteeId_status_idx`(`inviteeId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_roster_history` (
    `id` CHAR(36) NOT NULL,
    `teamId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `oldRole` VARCHAR(32) NULL,
    `newRole` VARCHAR(32) NULL,
    `changedById` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `team_roster_history_teamId_createdAt_idx`(`teamId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizations` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `slug` VARCHAR(128) NOT NULL,
    `logoUrl` VARCHAR(512) NULL,
    `coverUrl` VARCHAR(512) NULL,
    `description` TEXT NULL,
    `location` VARCHAR(128) NULL,
    `website` VARCHAR(255) NULL,
    `socialLinks` JSON NULL,
    `orgType` VARCHAR(64) NOT NULL DEFAULT 'CLUB',
    `verificationStatus` VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    `ownerId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `organizations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_memberships` (
    `id` CHAR(36) NOT NULL,
    `organizationId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'STAFF',
    `permissions` JSON NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `organization_memberships_organizationId_userId_key`(`organizationId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizer_profiles` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `slug` VARCHAR(64) NOT NULL,
    `displayName` VARCHAR(128) NOT NULL,
    `bio` TEXT NULL,
    `avatarUrl` VARCHAR(512) NULL,
    `coverUrl` VARCHAR(512) NULL,
    `location` VARCHAR(128) NULL,
    `website` VARCHAR(255) NULL,
    `socialLinks` JSON NULL,
    `experience` TEXT NULL,
    `verificationStatus` VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `organizer_profiles_userId_key`(`userId`),
    UNIQUE INDEX `organizer_profiles_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournaments` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `bannerUrl` VARCHAR(512) NULL,
    `thumbnailUrl` VARCHAR(512) NULL,
    `gameId` CHAR(36) NOT NULL,
    `organizerUserId` CHAR(36) NOT NULL,
    `organizationId` CHAR(36) NULL,
    `format` VARCHAR(64) NOT NULL DEFAULT 'SINGLE_ELIMINATION',
    `participationType` VARCHAR(32) NOT NULL DEFAULT 'TEAM',
    `teamSize` INTEGER NOT NULL DEFAULT 5,
    `minParticipants` INTEGER NOT NULL DEFAULT 2,
    `maxParticipants` INTEGER NOT NULL DEFAULT 16,
    `registrationStart` DATETIME(3) NOT NULL,
    `registrationDeadline` DATETIME(3) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'UTC',
    `locationMode` VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
    `locationDetails` VARCHAR(255) NULL,
    `rules` TEXT NULL,
    `prizePool` VARCHAR(128) NULL,
    `prizeStructure` JSON NULL,
    `visibility` VARCHAR(32) NOT NULL DEFAULT 'PUBLIC',
    `status` VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    `formatConfig` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tournaments_slug_key`(`slug`),
    INDEX `tournaments_status_startDate_idx`(`status`, `startDate`),
    INDEX `tournaments_gameId_status_idx`(`gameId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_staff` (
    `id` CHAR(36) NOT NULL,
    `tournamentId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'ADMIN',
    `permissions` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tournament_staff_tournamentId_userId_key`(`tournamentId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_registrations` (
    `id` CHAR(36) NOT NULL,
    `tournamentId` CHAR(36) NOT NULL,
    `entrantType` VARCHAR(32) NOT NULL DEFAULT 'TEAM',
    `gamerProfileId` CHAR(36) NULL,
    `teamId` CHAR(36) NULL,
    `registeredById` CHAR(36) NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    `seed` INTEGER NULL,
    `checkedIn` BOOLEAN NOT NULL DEFAULT false,
    `checkedInAt` DATETIME(3) NULL,
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tournament_registrations_tournamentId_status_idx`(`tournamentId`, `status`),
    UNIQUE INDEX `tournament_registrations_tournamentId_gamerProfileId_key`(`tournamentId`, `gamerProfileId`),
    UNIQUE INDEX `tournament_registrations_tournamentId_teamId_key`(`tournamentId`, `teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_members` (
    `id` CHAR(36) NOT NULL,
    `registrationId` CHAR(36) NOT NULL,
    `gamerProfileId` CHAR(36) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'STARTER',
    `inGameName` VARCHAR(128) NULL,
    `inGameUid` VARCHAR(128) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `registration_members_registrationId_gamerProfileId_key`(`registrationId`, `gamerProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_stages` (
    `id` CHAR(36) NOT NULL,
    `tournamentId` CHAR(36) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `stageType` VARCHAR(32) NOT NULL DEFAULT 'BRACKET',
    `sequence` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(32) NOT NULL DEFAULT 'UPCOMING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_rounds` (
    `id` CHAR(36) NOT NULL,
    `stageId` CHAR(36) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `sequence` INTEGER NOT NULL,
    `roundType` VARCHAR(32) NOT NULL DEFAULT 'UPPER',
    `status` VARCHAR(32) NOT NULL DEFAULT 'UPCOMING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competition_groups` (
    `id` CHAR(36) NOT NULL,
    `stageId` CHAR(36) NULL,
    `roundId` CHAR(36) NULL,
    `name` VARCHAR(128) NOT NULL,
    `sequence` INTEGER NOT NULL DEFAULT 1,
    `capacity` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` CHAR(36) NOT NULL,
    `tournamentId` CHAR(36) NOT NULL,
    `stageId` CHAR(36) NULL,
    `roundId` CHAR(36) NULL,
    `groupId` CHAR(36) NULL,
    `matchNumber` INTEGER NOT NULL,
    `title` VARCHAR(128) NULL,
    `scheduledTime` DATETIME(3) NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
    `lobbyInfo` VARCHAR(255) NULL,
    `serverRegion` VARCHAR(64) NULL,
    `winningRegistrationId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `matches_tournamentId_status_idx`(`tournamentId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_participants` (
    `id` CHAR(36) NOT NULL,
    `matchId` CHAR(36) NOT NULL,
    `registrationId` CHAR(36) NOT NULL,
    `slot` INTEGER NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `metrics` JSON NULL,
    `isWinner` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `match_participants_matchId_registrationId_key`(`matchId`, `registrationId`),
    UNIQUE INDEX `match_participants_matchId_slot_key`(`matchId`, `slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_credentials` (
    `id` CHAR(36) NOT NULL,
    `matchId` CHAR(36) NOT NULL,
    `roomId` VARCHAR(128) NOT NULL,
    `roomPasswordEncrypted` VARCHAR(512) NOT NULL,
    `lobbyDetails` TEXT NULL,
    `accessInstructions` TEXT NULL,
    `isReleased` BOOLEAN NOT NULL DEFAULT false,
    `releasedAt` DATETIME(3) NULL,
    `releasedById` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `match_credentials_matchId_key`(`matchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_results` (
    `id` CHAR(36) NOT NULL,
    `matchId` CHAR(36) NOT NULL,
    `currentApprovedRevisionId` CHAR(36) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `match_results_matchId_key`(`matchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_revisions` (
    `id` CHAR(36) NOT NULL,
    `resultId` CHAR(36) NOT NULL,
    `revisionNumber` INTEGER NOT NULL,
    `submittedById` CHAR(36) NOT NULL,
    `payload` JSON NOT NULL,
    `evidenceUrls` JSON NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    `reviewedById` CHAR(36) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `result_revisions_resultId_revisionNumber_key`(`resultId`, `revisionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `standing_snapshots` (
    `id` CHAR(36) NOT NULL,
    `tournamentId` CHAR(36) NOT NULL,
    `stageId` CHAR(36) NULL,
    `groupId` CHAR(36) NULL,
    `calcVersion` INTEGER NOT NULL DEFAULT 1,
    `isCurrent` BOOLEAN NOT NULL DEFAULT true,
    `sourceHash` VARCHAR(128) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `standing_snapshots_tournamentId_isCurrent_idx`(`tournamentId`, `isCurrent`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `standing_rows` (
    `id` CHAR(36) NOT NULL,
    `snapshotId` CHAR(36) NOT NULL,
    `registrationId` CHAR(36) NOT NULL,
    `rank` INTEGER NOT NULL,
    `played` INTEGER NOT NULL DEFAULT 0,
    `wins` INTEGER NOT NULL DEFAULT 0,
    `losses` INTEGER NOT NULL DEFAULT 0,
    `draws` INTEGER NOT NULL DEFAULT 0,
    `points` INTEGER NOT NULL DEFAULT 0,
    `metrics` JSON NULL,
    `tieBreakValues` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `standing_rows_snapshotId_registrationId_key`(`snapshotId`, `registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gamer_achievements` (
    `id` CHAR(36) NOT NULL,
    `gamerProfileId` CHAR(36) NOT NULL,
    `tournamentId` CHAR(36) NULL,
    `teamId` CHAR(36) NULL,
    `gameId` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(64) NOT NULL DEFAULT 'PARTICIPATION',
    `placement` INTEGER NULL,
    `verificationStatus` VARCHAR(32) NOT NULL DEFAULT 'EVOQ_VERIFIED',
    `sourceResultRevisionId` CHAR(36) NULL,
    `idempotencyKey` VARCHAR(255) NULL,
    `awardedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `gamer_achievements_idempotencyKey_key`(`idempotencyKey`),
    INDEX `gamer_achievements_gamerProfileId_verificationStatus_idx`(`gamerProfileId`, `verificationStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gamer_career_records` (
    `id` CHAR(36) NOT NULL,
    `gamerProfileId` CHAR(36) NOT NULL,
    `tournamentId` CHAR(36) NOT NULL,
    `teamId` CHAR(36) NULL,
    `gameId` CHAR(36) NOT NULL,
    `teamName` VARCHAR(128) NULL,
    `finalPlacement` INTEGER NULL,
    `matchesPlayed` INTEGER NOT NULL DEFAULT 0,
    `matchesWon` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `gamer_career_records_gamerProfileId_tournamentId_key`(`gamerProfileId`, `tournamentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gamer_statistics` (
    `id` CHAR(36) NOT NULL,
    `gamerProfileId` CHAR(36) NOT NULL,
    `gameId` CHAR(36) NULL,
    `tournamentsPlayed` INTEGER NOT NULL DEFAULT 0,
    `tournamentsWon` INTEGER NOT NULL DEFAULT 0,
    `podiumFinishes` INTEGER NOT NULL DEFAULT 0,
    `matchesPlayed` INTEGER NOT NULL DEFAULT 0,
    `matchesWon` INTEGER NOT NULL DEFAULT 0,
    `kills` INTEGER NOT NULL DEFAULT 0,
    `damage` DOUBLE NOT NULL DEFAULT 0,
    `customMetrics` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gamer_statistics_gamerProfileId_gameId_key`(`gamerProfileId`, `gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievement_proofs` (
    `id` CHAR(36) NOT NULL,
    `achievementId` CHAR(36) NOT NULL,
    `proofType` VARCHAR(64) NOT NULL DEFAULT 'RESULT_REVISION',
    `url` VARCHAR(512) NULL,
    `description` TEXT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizer_portfolio_records` (
    `id` CHAR(36) NOT NULL,
    `organizerProfileId` CHAR(36) NULL,
    `organizationId` CHAR(36) NULL,
    `tournamentId` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `gameName` VARCHAR(128) NULL,
    `participantCount` INTEGER NOT NULL DEFAULT 0,
    `completedMatches` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT true,
    `sourceType` VARCHAR(64) NOT NULL DEFAULT 'EVOQ_EVENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `recipientId` CHAR(36) NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `payload` JSON NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_recipientId_readAt_idx`(`recipientId`, `readAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` CHAR(36) NOT NULL,
    `ownerId` CHAR(36) NOT NULL,
    `provider` VARCHAR(64) NOT NULL DEFAULT 'LOCAL',
    `providerAssetId` VARCHAR(255) NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `mimeType` VARCHAR(128) NOT NULL,
    `fileSizeBytes` INTEGER NOT NULL,
    `visibility` VARCHAR(32) NOT NULL DEFAULT 'PUBLIC',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gamer_profiles` ADD CONSTRAINT `gamer_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_game_identities` ADD CONSTRAINT `gamer_game_identities_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `gamer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_game_identities` ADD CONSTRAINT `gamer_game_identities_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_captainId_fkey` FOREIGN KEY (`captainId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_primaryGameId_fkey` FOREIGN KEY (`primaryGameId`) REFERENCES `games`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_memberships` ADD CONSTRAINT `team_memberships_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_memberships` ADD CONSTRAINT `team_memberships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_inviterId_fkey` FOREIGN KEY (`inviterId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_inviteeId_fkey` FOREIGN KEY (`inviteeId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_roster_history` ADD CONSTRAINT `team_roster_history_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_memberships` ADD CONSTRAINT `organization_memberships_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_memberships` ADD CONSTRAINT `organization_memberships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizer_profiles` ADD CONSTRAINT `organizer_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_organizerUserId_fkey` FOREIGN KEY (`organizerUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_staff` ADD CONSTRAINT `tournament_staff_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_staff` ADD CONSTRAINT `tournament_staff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_gamerProfileId_fkey` FOREIGN KEY (`gamerProfileId`) REFERENCES `gamer_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_registeredById_fkey` FOREIGN KEY (`registeredById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_members` ADD CONSTRAINT `registration_members_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `tournament_registrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_members` ADD CONSTRAINT `registration_members_gamerProfileId_fkey` FOREIGN KEY (`gamerProfileId`) REFERENCES `gamer_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_stages` ADD CONSTRAINT `tournament_stages_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_rounds` ADD CONSTRAINT `tournament_rounds_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `tournament_stages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `competition_groups` ADD CONSTRAINT `competition_groups_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `tournament_stages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `competition_groups` ADD CONSTRAINT `competition_groups_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `tournament_rounds`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `tournament_stages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `tournament_rounds`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `competition_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_participants` ADD CONSTRAINT `match_participants_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_participants` ADD CONSTRAINT `match_participants_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `tournament_registrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_credentials` ADD CONSTRAINT `match_credentials_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_credentials` ADD CONSTRAINT `match_credentials_releasedById_fkey` FOREIGN KEY (`releasedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_revisions` ADD CONSTRAINT `result_revisions_resultId_fkey` FOREIGN KEY (`resultId`) REFERENCES `match_results`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_snapshots` ADD CONSTRAINT `standing_snapshots_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_snapshots` ADD CONSTRAINT `standing_snapshots_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `tournament_stages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_snapshots` ADD CONSTRAINT `standing_snapshots_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `competition_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_rows` ADD CONSTRAINT `standing_rows_snapshotId_fkey` FOREIGN KEY (`snapshotId`) REFERENCES `standing_snapshots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_rows` ADD CONSTRAINT `standing_rows_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `tournament_registrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_achievements` ADD CONSTRAINT `gamer_achievements_gamerProfileId_fkey` FOREIGN KEY (`gamerProfileId`) REFERENCES `gamer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_achievements` ADD CONSTRAINT `gamer_achievements_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_achievements` ADD CONSTRAINT `gamer_achievements_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_achievements` ADD CONSTRAINT `gamer_achievements_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_career_records` ADD CONSTRAINT `gamer_career_records_gamerProfileId_fkey` FOREIGN KEY (`gamerProfileId`) REFERENCES `gamer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_career_records` ADD CONSTRAINT `gamer_career_records_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_career_records` ADD CONSTRAINT `gamer_career_records_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_career_records` ADD CONSTRAINT `gamer_career_records_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_statistics` ADD CONSTRAINT `gamer_statistics_gamerProfileId_fkey` FOREIGN KEY (`gamerProfileId`) REFERENCES `gamer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamer_statistics` ADD CONSTRAINT `gamer_statistics_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievement_proofs` ADD CONSTRAINT `achievement_proofs_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `gamer_achievements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizer_portfolio_records` ADD CONSTRAINT `organizer_portfolio_records_organizerProfileId_fkey` FOREIGN KEY (`organizerProfileId`) REFERENCES `organizer_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizer_portfolio_records` ADD CONSTRAINT `organizer_portfolio_records_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizer_portfolio_records` ADD CONSTRAINT `organizer_portfolio_records_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
