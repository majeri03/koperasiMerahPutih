-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "public"."tenant_registrations" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "cooperative_name" TEXT NOT NULL,
    "ktp_document_url" TEXT,
    "sk_document_url" TEXT,
    "npwp_document_url" TEXT,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "tenant_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_nik_key" ON "public"."tenant_registrations"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_email_key" ON "public"."tenant_registrations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_phone_number_key" ON "public"."tenant_registrations"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_tenant_id_key" ON "public"."tenant_registrations"("tenant_id");

-- AddForeignKey
ALTER TABLE "public"."tenant_registrations" ADD CONSTRAINT "tenant_registrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
