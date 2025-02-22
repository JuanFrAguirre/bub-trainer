/*
  Warnings:

  - You are about to drop the column `completed` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `week` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `workoutDate` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "completed",
DROP COLUMN "date",
DROP COLUMN "week",
ADD COLUMN     "workoutDate" TIMESTAMP(3) NOT NULL;
