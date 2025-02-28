'use server';
import { prisma } from '@/lib/prisma';

export async function getExercises() {
  return await prisma.exercise.findMany();
}

export async function createExercise(name: string) {
  return await prisma.exercise.create({ data: { name } });
}

export async function getExerciseLastSessionData(exerciseId: string) {
  // Find the most recent exercise log for this exercise,
  // ordering by the createdAt timestamp of the parent workout session.
  const lastLog = await prisma.exerciseLog.findFirst({
    where: { exerciseId },
    orderBy: {
      workoutSession: {
        createdAt: 'desc',
      },
    },
    include: {
      ExerciseSetLog: true, // Include the set logs
    },
  });

  if (!lastLog) return null;

  // Map the set logs to only include the necessary data.
  return lastLog.ExerciseSetLog.map((set) => ({
    setNumber: set.setNumber,
    repetitions: set.repetitions,
    weight: set.weight,
  }));
}
