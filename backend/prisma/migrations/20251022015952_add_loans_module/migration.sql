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

-- CreateIndex
CREATE UNIQUE INDEX "loans_loan_number_key" ON "public"."loans"("loan_number");

-- AddForeignKey
ALTER TABLE "public"."loans" ADD CONSTRAINT "loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."loan_installments" ADD CONSTRAINT "loan_installments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
