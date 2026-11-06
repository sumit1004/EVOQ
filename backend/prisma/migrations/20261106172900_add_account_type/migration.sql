-- AlterTable
ALTER TABLE `users` ADD COLUMN `accountType` VARCHAR(32) NOT NULL DEFAULT 'GAMER';

-- CreateIndex
CREATE INDEX `users_accountType_idx` ON `users`(`accountType`);
