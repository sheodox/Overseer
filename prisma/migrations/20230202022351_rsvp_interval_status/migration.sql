/*
  Warnings:

  - Added the required column `status` to the `RsvpInterval` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RsvpInterval" ADD COLUMN     "status" TEXT NOT NULL;
