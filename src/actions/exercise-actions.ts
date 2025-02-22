'use server';
import { prisma } from '@/lib/prisma';

export async function getExercises() {
  return await prisma.exercise.findMany();
}

export async function createExercise(name: string) {
  return await prisma.exercise.create({ data: { name } });
}
