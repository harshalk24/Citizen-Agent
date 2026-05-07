/*
  Warnings:

  - You are about to drop the `Entitlement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JourneyProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "JourneyProgress_citizenId_journeyId_key";

-- AlterTable
ALTER TABLE "Citizen" ADD COLUMN "employment" TEXT;
ALTER TABLE "Citizen" ADD COLUMN "lifeEvent" TEXT;

-- AlterTable
ALTER TABLE "Deadline" ADD COLUMN "serviceName" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Entitlement";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JourneyProgress";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SavedService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "citizenId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "amount" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedService_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "citizenId" TEXT NOT NULL,
    "planJson" TEXT NOT NULL,
    "lifeEvent" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionPlan_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "citizenId" TEXT,
    "messages" TEXT NOT NULL DEFAULT '[]',
    "context" TEXT NOT NULL DEFAULT 'open',
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("citizenId", "createdAt", "id", "messages", "summary", "updatedAt") SELECT "citizenId", "createdAt", "id", "messages", "summary", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SavedService_citizenId_serviceId_key" ON "SavedService"("citizenId", "serviceId");
