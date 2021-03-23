-- CreateTable
CREATE TABLE "Echo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT E'',
    "tags" TEXT NOT NULL DEFAULT E'',
    "size" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initialUploaderId" TEXT NOT NULL,
    "lastUploaderId" TEXT NOT NULL,
    "uploading" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "oauthId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "generationVersion" INTEGER NOT NULL,
    "original" BYTEA NOT NULL,
    "large" BYTEA NOT NULL,
    "medium" BYTEA NOT NULL,
    "small" BYTEA NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateImage" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "raceId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BookerRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookerAssignment" (
    "id" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.oauthId_unique" ON "User"("oauthId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate.raceId_name_unique" ON "Candidate"("raceId", "name");

-- CreateIndex
CREATE INDEX "Candidate.raceId_index" ON "Candidate"("raceId");

-- CreateIndex
CREATE INDEX "CandidateImage.raceId_index" ON "CandidateImage"("raceId");

-- CreateIndex
CREATE INDEX "CandidateImage.candidateId_index" ON "CandidateImage"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote.candidateId_userId_unique" ON "Vote"("candidateId", "userId");

-- CreateIndex
CREATE INDEX "Vote.raceId_index" ON "Vote"("raceId");

-- CreateIndex
CREATE INDEX "Vote.candidateId_index" ON "Vote"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "BookerAssignment.concern_userId_unique" ON "BookerAssignment"("concern", "userId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateImage" ADD FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateImage" ADD FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateImage" ADD FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookerAssignment" ADD FOREIGN KEY ("roleId") REFERENCES "BookerRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookerAssignment" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
