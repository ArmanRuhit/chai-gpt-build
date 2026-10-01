-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trialLimitOverride" INTEGER,
ADD COLUMN     "trialMessagesUsed" INTEGER NOT NULL DEFAULT 0;
