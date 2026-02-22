-- CreateTable
CREATE TABLE "MythicPlusRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keystoneRunId" INTEGER NOT NULL,
    "dungeon" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "mythicLevel" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL,
    "clearTimeMs" INTEGER NOT NULL,
    "parTimeMs" INTEGER NOT NULL,
    "numKeystoneUpgrades" INTEGER NOT NULL,
    "mapChallengeModeId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "zoneExpansionId" INTEGER NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "backgroundImageUrl" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "url" TEXT NOT NULL,
    "affixes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    CONSTRAINT "PlayerRun_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "MythicPlusRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "playersSynced" INTEGER NOT NULL DEFAULT 0,
    "runsUpserted" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "durationMs" INTEGER,
    CONSTRAINT "SyncLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("createdAt", "id", "name", "slug", "updatedAt") SELECT "createdAt", "id", "name", "slug", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MythicPlusRun_keystoneRunId_key" ON "MythicPlusRun"("keystoneRunId");

-- CreateIndex
CREATE INDEX "MythicPlusRun_dungeon_idx" ON "MythicPlusRun"("dungeon");

-- CreateIndex
CREATE INDEX "MythicPlusRun_completedAt_idx" ON "MythicPlusRun"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRun_playerId_runId_key" ON "PlayerRun"("playerId", "runId");
