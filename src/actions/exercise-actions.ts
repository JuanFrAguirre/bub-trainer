'use server';
import { prisma } from '@/lib/prisma';

export async function getExercises() {
  const exercises = await prisma.exercise.findMany();
  return exercises;
}
