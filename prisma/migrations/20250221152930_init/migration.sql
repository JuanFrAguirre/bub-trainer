/*
  Warnings:

  - Added the required column `workoutName` to the `WorkoutTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutTemplate" ADD COLUMN     "workoutName" TEXT NOT NULL;
