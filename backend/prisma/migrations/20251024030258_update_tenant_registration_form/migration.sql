/*
  Warnings:

  - You are about to drop the column `full_name` on the `tenant_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `tenant_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `ktp_document_url` on the `tenant_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `nik` on the `tenant_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `npwp_document_url` on the `tenant_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `tenant_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `sk_document_url` on the `tenant_registrations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pic_nik]` on the table `tenant_registrations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pic_phone_number]` on the table `tenant_registrations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alamat_lengkap` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_address` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_date_of_birth` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_full_name` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_gender` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_nik` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_occupation` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_phone_number` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_place_of_birth` to the `tenant_registrations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."tenant_registrations_nik_key";

-- DropIndex
DROP INDEX "public"."tenant_registrations_phone_number_key";

-- AlterTable
ALTER TABLE "public"."tenant_registrations" DROP COLUMN "full_name",
DROP COLUMN "gender",
DROP COLUMN "ktp_document_url",
DROP COLUMN "nik",
DROP COLUMN "npwp_document_url",
DROP COLUMN "phone_number",
DROP COLUMN "sk_document_url",
ADD COLUMN     "alamat_lengkap" TEXT NOT NULL,
ADD COLUMN     "dok_akte_notaris" TEXT,
ADD COLUMN     "dok_daftar_umum" TEXT,
ADD COLUMN     "dok_npwp_koperasi" TEXT,
ADD COLUMN     "dok_pengesahan_pendirian" TEXT,
ADD COLUMN     "peta_lokasi" TEXT,
ADD COLUMN     "pic_address" TEXT NOT NULL,
ADD COLUMN     "pic_date_of_birth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pic_full_name" TEXT NOT NULL,
ADD COLUMN     "pic_gender" "public"."Gender" NOT NULL,
ADD COLUMN     "pic_nik" TEXT NOT NULL,
ADD COLUMN     "pic_occupation" TEXT NOT NULL,
ADD COLUMN     "pic_phone_number" TEXT NOT NULL,
ADD COLUMN     "pic_place_of_birth" TEXT NOT NULL,
ADD COLUMN     "sk_ahu_koperasi" TEXT;

-- CreateTable
CREATE TABLE "public"."guest_books" (
    "id" TEXT NOT NULL,
    "entry_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guest_name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "meet_with" TEXT,
    "purpose" TEXT NOT NULL,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_suggestions" (
    "id" TEXT NOT NULL,
    "suggestion_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "member_id" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "signature_url" TEXT,
    "response" TEXT,
    "response_by_user_id" TEXT,
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supervisory_suggestions" (
    "id" TEXT NOT NULL,
    "suggestion_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supervisor_member_id" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "supervisor_signature_url" TEXT,
    "response" TEXT,
    "response_by_user_id" TEXT,
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisory_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."official_recommendations" (
    "id" TEXT NOT NULL,
    "entry_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "official_name" TEXT NOT NULL,
    "official_position_and_address" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "official_signature_url" TEXT,
    "response" TEXT,
    "response_by_user_id" TEXT,
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."important_events" (
    "id" TEXT NOT NULL,
    "entry_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "cause_and_notes" TEXT,
    "recorded_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "important_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agenda_expeditions" (
    "id" TEXT NOT NULL,
    "entry_number" SERIAL NOT NULL,
    "letter_number" TEXT NOT NULL,
    "letter_date" TIMESTAMP(3) NOT NULL,
    "addressed_to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_expeditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_pic_nik_key" ON "public"."tenant_registrations"("pic_nik");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_pic_phone_number_key" ON "public"."tenant_registrations"("pic_phone_number");

-- AddForeignKey
ALTER TABLE "public"."member_suggestions" ADD CONSTRAINT "member_suggestions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_suggestions" ADD CONSTRAINT "member_suggestions_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supervisory_suggestions" ADD CONSTRAINT "supervisory_suggestions_supervisor_member_id_fkey" FOREIGN KEY ("supervisor_member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supervisory_suggestions" ADD CONSTRAINT "supervisory_suggestions_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."official_recommendations" ADD CONSTRAINT "official_recommendations_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."important_events" ADD CONSTRAINT "important_events_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
