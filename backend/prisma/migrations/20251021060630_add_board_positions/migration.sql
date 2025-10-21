-- CreateTable
CREATE TABLE "public"."board_positions" (
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

    CONSTRAINT "board_positions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."board_positions" ADD CONSTRAINT "board_positions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
