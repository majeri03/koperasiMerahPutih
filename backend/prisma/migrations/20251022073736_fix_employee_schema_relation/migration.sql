/*
  Warnings:

  - You are about to drop the column `userId` on the `employees` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_userId_fkey";

-- AlterTable
ALTER TABLE "public"."employees" DROP COLUMN "userId";
