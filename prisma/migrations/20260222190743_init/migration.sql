-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('rdps', 'mdps', 'tank', 'healer');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "main" TEXT,
    "playerName" TEXT,
    "assignedRole" "Role",
    "spec" TEXT,
    "eventId" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerServer" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "twoFactorSecret" TEXT,
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MythicPlusRun" (
    "id" TEXT NOT NULL,
    "keystoneRunId" INTEGER NOT NULL,
    "dungeon" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "mythicLevel" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "clearTimeMs" INTEGER NOT NULL,
    "parTimeMs" INTEGER NOT NULL,
    "numKeystoneUpgrades" INTEGER NOT NULL,
    "mapChallengeModeId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "zoneExpansionId" INTEGER NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "backgroundImageUrl" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "url" TEXT NOT NULL,
    "affixes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MythicPlusRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerRun" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,

    CONSTRAINT "PlayerRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "playersSynced" INTEGER NOT NULL DEFAULT 0,
    "runsUpserted" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedPlayerProfile" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "activeSpecName" TEXT NOT NULL,
    "activeSpecRole" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "realm" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "itemLevelEquipped" INTEGER NOT NULL,
    "gearItems" JSONB NOT NULL,
    "bestRuns" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedPlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MythicPlusRun_keystoneRunId_key" ON "MythicPlusRun"("keystoneRunId");

-- CreateIndex
CREATE INDEX "MythicPlusRun_dungeon_idx" ON "MythicPlusRun"("dungeon");

-- CreateIndex
CREATE INDEX "MythicPlusRun_completedAt_idx" ON "MythicPlusRun"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRun_playerId_runId_key" ON "PlayerRun"("playerId", "runId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedPlayerProfile_playerId_key" ON "CachedPlayerProfile"("playerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRun" ADD CONSTRAINT "PlayerRun_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRun" ADD CONSTRAINT "PlayerRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "MythicPlusRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedPlayerProfile" ADD CONSTRAINT "CachedPlayerProfile_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
