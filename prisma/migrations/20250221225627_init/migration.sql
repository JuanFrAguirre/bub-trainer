/*
  Warnings:

  - You are about to drop the column `description` on the `ExerciseTemplate` table. All the data in the column will be lost.
  - Added the required column `exerciseId` to the `ExerciseLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exerciseId` to the `ExerciseTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExerciseLog" ADD COLUMN     "exerciseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExerciseTemplate" DROP COLUMN "description",
ADD COLUMN     "exerciseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
