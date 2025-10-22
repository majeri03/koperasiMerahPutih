-- CreateTable
CREATE TABLE "public"."member_meeting_notes" (
    "id" TEXT NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "meetingType" TEXT NOT NULL,
    "total_members" INTEGER NOT NULL,
    "members_present" INTEGER NOT NULL,
    "leader" TEXT NOT NULL,
    "attendees" TEXT,
    "agendaAndDecision" TEXT NOT NULL,
    "document_url" TEXT,
    "notulis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_meeting_notes_pkey" PRIMARY KEY ("id")
);
