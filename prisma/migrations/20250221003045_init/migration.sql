/*
  Warnings:

  - You are about to drop the column `dayNumber` on the `WorkoutTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `WorkoutTemplate` table. All the data in the column will be lost.
  - Added the required column `date` to the `WorkoutSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workoutDay` to the `WorkoutTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutSession" ADD COLUMN     "date" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutTemplate" DROP COLUMN "dayNumber",
DROP COLUMN "name",
ADD COLUMN     "workoutDay" INTEGER NOT NULL;
