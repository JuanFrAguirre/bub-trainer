/*
  Warnings:

  - You are about to drop the column `repetitions` on the `ExerciseLog` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `ExerciseLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExerciseLog" DROP COLUMN "repetitions",
DROP COLUMN "weight",
ALTER COLUMN "sets" SET DEFAULT 0,
ALTER COLUMN "rest" SET DEFAULT 60;

-- CreateTable
CREATE TABLE "ExerciseSetLog" (
    "id" TEXT NOT NULL,
    "exerciseLogId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "weight" TEXT NOT NULL,

    CONSTRAINT "ExerciseSetLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseSetLog" ADD CONSTRAINT "ExerciseSetLog_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "ExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
