-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tasting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "beerId" TEXT NOT NULL,
    "appearance" TEXT NOT NULL,
    "foam" TEXT NOT NULL,
    "aroma" TEXT NOT NULL,
    "flavor" TEXT NOT NULL,
    "creaminess" TEXT NOT NULL,
    "aftertaste" TEXT NOT NULL,
    "drinkability" TEXT NOT NULL,
    "dryFinish" TEXT NOT NULL,
    "carbonation" TEXT NOT NULL,
    "idealOccasion" TEXT,
    "imageUrl" TEXT,
    "appearanceScore" INTEGER NOT NULL,
    "foamScore" INTEGER NOT NULL,
    "aromaScore" INTEGER NOT NULL,
    "flavorScore" INTEGER NOT NULL,
    "creaminessScore" INTEGER NOT NULL,
    "aftertasteScore" INTEGER NOT NULL,
    "drinkabilityScore" INTEGER NOT NULL,
    "dryFinishScore" INTEGER NOT NULL,
    "carbonationScore" INTEGER NOT NULL,
    "perceptionScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tasting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tasting_beerId_fkey" FOREIGN KEY ("beerId") REFERENCES "Beer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tasting" ("aftertaste", "aftertasteScore", "appearance", "appearanceScore", "aroma", "aromaScore", "beerId", "carbonation", "carbonationScore", "creaminess", "creaminessScore", "createdAt", "drinkability", "drinkabilityScore", "dryFinish", "dryFinishScore", "flavor", "flavorScore", "foam", "foamScore", "id", "idealOccasion", "perceptionScore", "updatedAt", "userId") SELECT "aftertaste", "aftertasteScore", "appearance", "appearanceScore", "aroma", "aromaScore", "beerId", "carbonation", "carbonationScore", "creaminess", "creaminessScore", "createdAt", "drinkability", "drinkabilityScore", "dryFinish", "dryFinishScore", "flavor", "flavorScore", "foam", "foamScore", "id", "idealOccasion", "perceptionScore", "updatedAt", "userId" FROM "Tasting";
DROP TABLE "Tasting";
ALTER TABLE "new_Tasting" RENAME TO "Tasting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
