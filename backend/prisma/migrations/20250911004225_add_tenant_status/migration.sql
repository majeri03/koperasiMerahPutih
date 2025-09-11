/*
  Warnings:

  - You are about to drop the column `is_active` on the `tenants` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TenantStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "public"."tenants" DROP COLUMN "is_active",
ADD COLUMN     "status" "public"."TenantStatus" NOT NULL DEFAULT 'PENDING';
