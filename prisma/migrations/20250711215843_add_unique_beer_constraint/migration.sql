/*
  Warnings:

  - A unique constraint covering the columns `[name,breweryId]` on the table `Beer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Beer_name_breweryId_key" ON "Beer"("name", "breweryId");
