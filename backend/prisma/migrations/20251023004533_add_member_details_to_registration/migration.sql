/*
  Warnings:

  - Added the required column `address` to the `member_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `member_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `member_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_of_birth` to the `member_registrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."member_registrations" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "date_of_birth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "occupation" TEXT NOT NULL,
ADD COLUMN     "place_of_birth" TEXT NOT NULL;
