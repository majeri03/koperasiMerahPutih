-- CreateEnum
CREATE TYPE "public"."TenantStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."JabatanPengurus" AS ENUM ('Ketua', 'Sekretaris', 'Bendahara');

-- CreateEnum
CREATE TYPE "public"."JenisSimpanan" AS ENUM ('POKOK', 'WAJIB', 'SUKARELA');

-- CreateEnum
CREATE TYPE "public"."TipeTransaksiSimpanan" AS ENUM ('SETORAN', 'PENARIKAN');

-- CreateEnum
CREATE TYPE "public"."InventoryCondition" AS ENUM ('BAIK', 'PERLU_PERBAIKAN', 'RUSAK');

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "status" "public"."TenantStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "hashed_refresh_token" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."member_registrations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "nik" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "place_of_birth" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "processed_by_id" TEXT,
    "processed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "member_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "member_number" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "place_of_birth" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "occupation" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fingerprint_url" TEXT,
    "signature_url" TEXT,
    "resignation_request_date" TIMESTAMP(3),
    "termination_date" TIMESTAMP(3),
    "termination_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."board_positions" (
    "id" TEXT NOT NULL,
    "jabatan" "public"."JabatanPengurus" NOT NULL,
    "tanggal_diangkat" TIMESTAMP(3) NOT NULL,
    "tanggal_berhenti" TIMESTAMP(3),
    "alasan_berhenti" TEXT,
    "member_id" TEXT NOT NULL,
    "fingerprint_url" TEXT,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supervisory_positions" (
    "id" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "tanggal_diangkat" TIMESTAMP(3) NOT NULL,
    "tanggal_berhenti" TIMESTAMP(3),
    "alasan_berhenti" TEXT,
    "member_id" TEXT NOT NULL,
    "fingerprint_url" TEXT,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisory_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."simpanan_transaksi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nomor_bukti" TEXT,
    "uraian" TEXT NOT NULL,
    "jenis" "public"."JenisSimpanan" NOT NULL,
    "tipe" "public"."TipeTransaksiSimpanan" NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "member_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simpanan_transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."simpanan_saldo" (
    "id" TEXT NOT NULL,
    "saldo_pokok" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldo_wajib" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldo_sukarela" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "member_id" TEXT NOT NULL,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simpanan_saldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."loans" (
    "id" TEXT NOT NULL,
    "loan_number" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "loan_amount" DOUBLE PRECISION NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "loan_date" TIMESTAMP(3) NOT NULL,
    "term_months" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT,
    "agreement_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "paid_off_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."loan_installments" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "principal_amount" DOUBLE PRECISION NOT NULL,
    "interest_amount" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_items" (
    "id" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "technical_life_span" INTEGER,
    "economic_life_span" INTEGER,
    "condition" "public"."InventoryCondition" NOT NULL DEFAULT 'BAIK',
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_meeting_notes" (
    "id" TEXT NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "meeting_type" TEXT NOT NULL,
    "total_members" INTEGER NOT NULL,
    "members_present" INTEGER NOT NULL,
    "leader" TEXT NOT NULL,
    "attendees" TEXT,
    "agenda_and_decision" TEXT NOT NULL,
    "document_url" TEXT,
    "notulis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_meeting_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."board_meeting_notes" (
    "id" TEXT NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "meeting_type" TEXT NOT NULL,
    "total_board" INTEGER NOT NULL,
    "board_present" INTEGER NOT NULL,
    "leader" TEXT NOT NULL,
    "attendees" TEXT,
    "agenda_and_decision" TEXT NOT NULL,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_meeting_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supervisory_meeting_notes" (
    "id" TEXT NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "meeting_type" TEXT NOT NULL,
    "total_supervisory" INTEGER NOT NULL,
    "supervisory_present" INTEGER NOT NULL,
    "leader" TEXT NOT NULL,
    "attendees" TEXT,
    "agenda_and_decision" TEXT NOT NULL,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisory_meeting_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "id" TEXT NOT NULL,
    "employee_number" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "place_of_birth" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "address" TEXT NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "position" TEXT NOT NULL,
    "notes" TEXT,
    "signature_url" TEXT,
    "approved_by_pengurus_id" TEXT,
    "approved_by_ketua_id" TEXT,
    "ketua_approval_date" TIMESTAMP(3),
    "termination_date" TIMESTAMP(3),
    "termination_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "public"."tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_schema_name_key" ON "public"."tenants"("schema_name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_nik_key" ON "public"."tenant_registrations"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_email_key" ON "public"."tenant_registrations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_phone_number_key" ON "public"."tenant_registrations"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registrations_tenant_id_key" ON "public"."tenant_registrations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_registrations_nik_key" ON "public"."member_registrations"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "member_registrations_email_key" ON "public"."member_registrations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_member_number_key" ON "public"."members"("member_number");

-- CreateIndex
CREATE UNIQUE INDEX "members_nik_key" ON "public"."members"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "simpanan_saldo_member_id_key" ON "public"."simpanan_saldo"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "loans_loan_number_key" ON "public"."loans"("loan_number");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_item_code_key" ON "public"."inventory_items"("item_code");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_registrations" ADD CONSTRAINT "tenant_registrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_registrations" ADD CONSTRAINT "member_registrations_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."board_positions" ADD CONSTRAINT "board_positions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supervisory_positions" ADD CONSTRAINT "supervisory_positions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simpanan_transaksi" ADD CONSTRAINT "simpanan_transaksi_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simpanan_transaksi" ADD CONSTRAINT "simpanan_transaksi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simpanan_saldo" ADD CONSTRAINT "simpanan_saldo_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."loans" ADD CONSTRAINT "loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."loan_installments" ADD CONSTRAINT "loan_installments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_approved_by_pengurus_id_fkey" FOREIGN KEY ("approved_by_pengurus_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_approved_by_ketua_id_fkey" FOREIGN KEY ("approved_by_ketua_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
