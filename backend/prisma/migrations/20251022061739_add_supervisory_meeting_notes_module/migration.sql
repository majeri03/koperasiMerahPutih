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
