/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Brewery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Brewery_name_key" ON "Brewery"("name");
