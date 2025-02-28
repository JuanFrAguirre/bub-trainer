'use server';

import { prisma } from '@/lib/prisma';
import { workouts } from '@/seed/seed-data';

// Fetch all workout templates with their exercises
export async function getTemplateWorkouts() {
  const workouts = await prisma.workoutTemplate.findMany({
    include: {
      exercises: {
        include: { exercise: true }, // Include exercise details
      },
    },
  });
  return workouts.sort((a, b) => a.workoutDay - b.workoutDay);
}

export async function getTemplateWorkout(id: string) {
  return await prisma.workoutTemplate.findFirst({
    where: { id },
    include: { exercises: { include: { exercise: true } } },
  });
}

// Create a seed workout with predefined exercises
export async function createSeedWorkout() {
  return await Promise.all(
    workouts.map(async (workout) =>
      prisma.workoutTemplate.create({
        data: {
          ...workout,
          exercises: { create: await mapExercises(workout.exercises) },
        },
      }),
    ),
  );
}

// Create a new workout template
export async function createWorkoutTemplate(workoutData: {
  workoutDay: number;
  workoutName: string;
  exercises: {
    name: string;
    sets: number;
    repetitions: number;
    weight: string;
    rest: number;
  }[];
}) {
  return await prisma.workoutTemplate.create({
    data: {
      workoutName: workoutData.workoutName,
      workoutDay: workoutData.workoutDay,
      exercises: {
        create: await mapExercises(workoutData.exercises),
      },
    },
    include: { exercises: { include: { exercise: true } } },
  });
}

// Update a workout template
export async function updateWorkoutTemplate(
  id: string,
  workoutData: {
    workoutDay: number;
    workoutName: string;
    exercises: {
      // For existing exercises, include the id.
      id?: string;
      name: string;
      sets: number;
      repetitions: number;
      weight: string;
      rest: number;
      remove?: boolean; // Flag to indicate removal
    }[];
  },
) {
  // First update the workout template fields.
  const updatedTemplate = await prisma.workoutTemplate.update({
    where: { id },
    data: {
      workoutDay: workoutData.workoutDay,
      workoutName: workoutData.workoutName,
    },
  });

  // Process each exercise.
  const processedExercises = await Promise.all(
    workoutData.exercises.map(async (exercise) => {
      if (exercise.id) {
        // If the exercise should be removed, mark it inactive.
        if (exercise.remove) {
          return await prisma.exerciseTemplate.update({
            where: { id: exercise.id },
            data: { isActive: false },
          });
        } else {
          // Otherwise, update the fields.
          return await prisma.exerciseTemplate.update({
            where: { id: exercise.id },
            data: {
              sets: exercise.sets,
              repetitions: exercise.repetitions,
              weight: exercise.weight,
              rest: exercise.rest,
              isActive: true, // ensure it's active
            },
          });
        }
      } else {
        // For new exercises, create them.
        let existingExercise = await prisma.exercise.findUnique({
          where: { name: exercise.name },
        });
        if (!existingExercise) {
          existingExercise = await prisma.exercise.create({
            data: { name: exercise.name },
          });
        }
        return await prisma.exerciseTemplate.create({
          data: {
            workoutTemplateId: id,
            exerciseId: existingExercise.id,
            sets: exercise.sets,
            repetitions: exercise.repetitions,
            weight: exercise.weight,
            rest: exercise.rest,
            isActive: true,
          },
        });
      }
    }),
  );

  return { updatedTemplate, processedExercises };
}

// Delete a workout template
export async function deleteWorkoutTemplate(id: string) {
  return await prisma.workoutTemplate.delete({ where: { id } });
}

// Helper function to map exercises and avoid duplication
async function mapExercises(
  exercises: {
    name: string;
    sets: number;
    repetitions: number;
    weight: string;
    rest: number;
  }[],
) {
  return Promise.all(
    exercises.map(async (exercise) => {
      // Check if the exercise already exists
      let existingExercise = await prisma.exercise.findUnique({
        where: { name: exercise.name },
      });

      // If not, create a new one
      if (!existingExercise) {
        existingExercise = await prisma.exercise.create({
          data: { name: exercise.name },
        });
      }

      return {
        exerciseId: existingExercise.id,
        sets: exercise.sets,
        repetitions: exercise.repetitions,
        weight: exercise.weight,
        rest: exercise.rest,
      };
    }),
  );
}
