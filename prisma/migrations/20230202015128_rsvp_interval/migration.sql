/*
  Warnings:

  - You are about to drop the `RsvpDay` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RsvpDay" DROP CONSTRAINT "RsvpDay_eventId_fkey";

-- DropForeignKey
ALTER TABLE "RsvpDay" DROP CONSTRAINT "RsvpDay_rsvpId_fkey";

-- DropForeignKey
ALTER TABLE "RsvpDay" DROP CONSTRAINT "RsvpDay_userId_fkey";

-- DropTable
DROP TABLE "RsvpDay";

-- CreateTable
CREATE TABLE "EventInterval" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "canStayOvernight" BOOLEAN NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventInterval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsvpInterval" (
    "id" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "stayingOvernight" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventIntervalId" TEXT NOT NULL,

    CONSTRAINT "RsvpInterval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RsvpInterval_eventId_userId_eventIntervalId_key" ON "RsvpInterval"("eventId", "userId", "eventIntervalId");

-- AddForeignKey
ALTER TABLE "EventInterval" ADD CONSTRAINT "EventInterval_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInterval" ADD CONSTRAINT "EventInterval_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpInterval" ADD CONSTRAINT "RsvpInterval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpInterval" ADD CONSTRAINT "RsvpInterval_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "Rsvp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpInterval" ADD CONSTRAINT "RsvpInterval_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpInterval" ADD CONSTRAINT "RsvpInterval_eventIntervalId_fkey" FOREIGN KEY ("eventIntervalId") REFERENCES "EventInterval"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
