-- CreateEnum
CREATE TYPE "public"."JenisSimpanan" AS ENUM ('POKOK', 'WAJIB', 'SUKARELA');

-- CreateEnum
CREATE TYPE "public"."TipeTransaksiSimpanan" AS ENUM ('SETORAN', 'PENARIKAN');

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

-- CreateIndex
CREATE UNIQUE INDEX "simpanan_saldo_member_id_key" ON "public"."simpanan_saldo"("member_id");

-- AddForeignKey
ALTER TABLE "public"."simpanan_transaksi" ADD CONSTRAINT "simpanan_transaksi_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simpanan_transaksi" ADD CONSTRAINT "simpanan_transaksi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simpanan_saldo" ADD CONSTRAINT "simpanan_saldo_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
