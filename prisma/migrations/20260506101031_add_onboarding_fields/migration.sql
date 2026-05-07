-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Citizen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT,
    "name" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IE',
    "employment" TEXT,
    "lifeEvent" TEXT,
    "firstName" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Citizen" ("country", "createdAt", "employment", "id", "lifeEvent", "name", "phone", "verified") SELECT "country", "createdAt", "employment", "id", "lifeEvent", "name", "phone", "verified" FROM "Citizen";
DROP TABLE "Citizen";
ALTER TABLE "new_Citizen" RENAME TO "Citizen";
CREATE UNIQUE INDEX "Citizen_phone_key" ON "Citizen"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
