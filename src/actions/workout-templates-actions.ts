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
    include: {
      exercises: {
        where: { isActive: true }, // Only include active exercises
        include: { exercise: true },
      },
    },
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
      id?: string;
      name: string;
      sets: number;
      repetitions: number;
      weight: string;
      rest: number;
      remove?: boolean; // Optional flag if you want to explicitly mark removal
    }[];
  },
) {
  // 1. Update the workout template fields.
  const updatedTemplate = await prisma.workoutTemplate.update({
    where: { id },
    data: {
      workoutDay: workoutData.workoutDay,
      workoutName: workoutData.workoutName,
    },
  });

  // 2. Get current active exercises for the template.
  const currentActiveExercises = await prisma.exerciseTemplate.findMany({
    where: { workoutTemplateId: id, isActive: true },
  });

  // 3. Build a set of exercise IDs that are present in the payload.
  const payloadExerciseIds = new Set<string>();
  for (const exercise of workoutData.exercises) {
    if (exercise.id) {
      payloadExerciseIds.add(exercise.id);
    }
  }

  // 4. For each active exercise that isn't in the payload, mark it inactive.
  const markMissingInactivePromises = currentActiveExercises
    .filter((ex) => !payloadExerciseIds.has(ex.id))
    .map((ex) =>
      prisma.exerciseTemplate.update({
        where: { id: ex.id },
        data: { isActive: false },
      }),
    );
  await Promise.all(markMissingInactivePromises);

  // 5. Process each exercise in the payload.
  const processedExercises = await Promise.all(
    workoutData.exercises.map(async (exercise) => {
      if (exercise.id) {
        // If the exercise should be removed explicitly.
        if (exercise.remove) {
          return await prisma.exerciseTemplate.update({
            where: { id: exercise.id },
            data: { isActive: false },
          });
        } else {
          // Update existing record if found.
          const existing = await prisma.exerciseTemplate.findUnique({
            where: { id: exercise.id },
          });
          if (existing) {
            return await prisma.exerciseTemplate.update({
              where: { id: exercise.id },
              data: {
                sets: exercise.sets,
                repetitions: exercise.repetitions,
                weight: exercise.weight,
                rest: exercise.rest,
                isActive: true,
              },
            });
          }
          // If not found, fall back to creation.
        }
      }
      // For new exercises or if no ID is provided:
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
