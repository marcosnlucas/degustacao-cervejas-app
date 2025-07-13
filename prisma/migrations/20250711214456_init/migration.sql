-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Brewery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Beer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "breweryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Beer_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "Brewery" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tasting" (
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
    "idealOccasion" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
