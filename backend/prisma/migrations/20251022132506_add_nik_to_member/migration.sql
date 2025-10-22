/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nik` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "nik" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "members_nik_key" ON "members"("nik");
