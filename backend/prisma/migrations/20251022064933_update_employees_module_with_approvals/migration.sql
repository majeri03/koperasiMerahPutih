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
    "userId" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_approved_by_pengurus_id_fkey" FOREIGN KEY ("approved_by_pengurus_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_approved_by_ketua_id_fkey" FOREIGN KEY ("approved_by_ketua_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
