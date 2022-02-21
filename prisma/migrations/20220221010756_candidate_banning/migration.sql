-- DropForeignKey
ALTER TABLE "BookerAssignment" DROP CONSTRAINT "BookerAssignment_roleId_fkey";

-- DropForeignKey
ALTER TABLE "BookerAssignment" DROP CONSTRAINT "BookerAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_raceId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateImage" DROP CONSTRAINT "CandidateImage_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateImage" DROP CONSTRAINT "CandidateImage_imageId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateImage" DROP CONSTRAINT "CandidateImage_raceId_fkey";

-- DropForeignKey
ALTER TABLE "EchoImage" DROP CONSTRAINT "EchoImage_echoId_fkey";

-- DropForeignKey
ALTER TABLE "EchoImage" DROP CONSTRAINT "EchoImage_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Rsvp" DROP CONSTRAINT "Rsvp_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Rsvp" DROP CONSTRAINT "Rsvp_userId_fkey";

-- DropForeignKey
ALTER TABLE "RsvpDay" DROP CONSTRAINT "RsvpDay_eventId_fkey";

-- DropForeignKey
ALTER TABLE "RsvpDay" DROP CONSTRAINT "RsvpDay_rsvpId_fkey";

-- DropForeignKey
ALTER TABLE "RsvpDay" DROP CONSTRAINT "RsvpDay_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPushSubscription" DROP CONSTRAINT "UserPushSubscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_raceId_fkey";

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "EchoImage" ADD CONSTRAINT "EchoImage_echoId_fkey" FOREIGN KEY ("echoId") REFERENCES "Echo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EchoImage" ADD CONSTRAINT "EchoImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPushSubscription" ADD CONSTRAINT "UserPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateImage" ADD CONSTRAINT "CandidateImage_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateImage" ADD CONSTRAINT "CandidateImage_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateImage" ADD CONSTRAINT "CandidateImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookerAssignment" ADD CONSTRAINT "BookerAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "BookerRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookerAssignment" ADD CONSTRAINT "BookerAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpDay" ADD CONSTRAINT "RsvpDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpDay" ADD CONSTRAINT "RsvpDay_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "Rsvp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpDay" ADD CONSTRAINT "RsvpDay_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "AppMetadata.key_unique" RENAME TO "AppMetadata_key_key";

-- RenameIndex
ALTER INDEX "BookerAssignment.concern_userId_unique" RENAME TO "BookerAssignment_concern_userId_key";

-- RenameIndex
ALTER INDEX "Candidate.raceId_index" RENAME TO "Candidate_raceId_idx";

-- RenameIndex
ALTER INDEX "Candidate.raceId_name_unique" RENAME TO "Candidate_raceId_name_key";

-- RenameIndex
ALTER INDEX "CandidateImage.candidateId_index" RENAME TO "CandidateImage_candidateId_idx";

-- RenameIndex
ALTER INDEX "CandidateImage.raceId_index" RENAME TO "CandidateImage_raceId_idx";

-- RenameIndex
ALTER INDEX "EchoImage.echoId_index" RENAME TO "EchoImage_echoId_idx";

-- RenameIndex
ALTER INDEX "Notification.userId_read_index" RENAME TO "Notification_userId_read_idx";

-- RenameIndex
ALTER INDEX "Rsvp.eventId_userId_unique" RENAME TO "Rsvp_eventId_userId_key";

-- RenameIndex
ALTER INDEX "RsvpDay.eventId_date_index" RENAME TO "RsvpDay_eventId_date_idx";

-- RenameIndex
ALTER INDEX "RsvpDay.eventId_userId_date_unique" RENAME TO "RsvpDay_eventId_userId_date_key";

-- RenameIndex
ALTER INDEX "User.oauthId_unique" RENAME TO "User_oauthId_key";

-- RenameIndex
ALTER INDEX "User_settingsId_unique" RENAME TO "User_settingsId_key";

-- RenameIndex
ALTER INDEX "UserPushSubscription.userId_index" RENAME TO "UserPushSubscription_userId_idx";

-- RenameIndex
ALTER INDEX "UserSettings.userId_unique" RENAME TO "UserSettings_userId_key";

-- RenameIndex
ALTER INDEX "Vote.candidateId_index" RENAME TO "Vote_candidateId_idx";

-- RenameIndex
ALTER INDEX "Vote.candidateId_userId_unique" RENAME TO "Vote_candidateId_userId_key";

-- RenameIndex
ALTER INDEX "Vote.raceId_index" RENAME TO "Vote_raceId_idx";
