/*
  Warnings:

  - You are about to drop the column `agendaAndDecision` on the `member_meeting_notes` table. All the data in the column will be lost.
  - You are about to drop the column `meetingType` on the `member_meeting_notes` table. All the data in the column will be lost.
  - Added the required column `agenda_and_decision` to the `member_meeting_notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meeting_type` to the `member_meeting_notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."member_meeting_notes" DROP COLUMN "agendaAndDecision",
DROP COLUMN "meetingType",
ADD COLUMN     "agenda_and_decision" TEXT NOT NULL,
ADD COLUMN     "meeting_type" TEXT NOT NULL;

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
