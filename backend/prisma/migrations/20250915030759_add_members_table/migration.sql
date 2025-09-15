-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "member_number" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "members_member_number_key" ON "public"."members"("member_number");
