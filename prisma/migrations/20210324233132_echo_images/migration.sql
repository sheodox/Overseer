-- CreateTable
CREATE TABLE "EchoImage" (
    "id" TEXT NOT NULL,
    "echoId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EchoImage.echoId_index" ON "EchoImage"("echoId");

-- AddForeignKey
ALTER TABLE "EchoImage" ADD FOREIGN KEY ("echoId") REFERENCES "Echo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EchoImage" ADD FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
