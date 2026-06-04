/*
  Warnings:

  - The `interests` column on the `StudentProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subjects` column on the `TutorProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('MATH', 'PHYSICS', 'CHEMISTRY', 'ENGLISH', 'COMPUTER_SCIENCE', 'ECONOMICS', 'ACCOUNTING');

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "school" TEXT,
DROP COLUMN "interests",
ADD COLUMN     "interests" "Subject"[];

-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "profileImage" TEXT,
DROP COLUMN "subjects",
ADD COLUMN     "subjects" "Subject"[];
