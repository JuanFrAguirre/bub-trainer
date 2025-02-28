'use server';

import { prisma } from '@/lib/prisma';

export default async function logWorkoutSessionExample() {
  try {
    const session = await prisma.workoutSession.create({
      data: {
        templateId: '302b7453-be78-42e9-99af-b6ede4412041', // Replace with an actual template ID
        date: new Date().toISOString(),
        isCompleted: true,
        exercises: {
          create: [
            {
              exerciseTemplateId: '25191505-c16a-40f8-9a27-c8b92f962435',
              exerciseId: 'f05ac92c-25b0-4080-84c1-87078ef695b3',
              sets: 3,
              ExerciseSetLog: {
                create: [
                  { setNumber: 1, repetitions: 10, weight: '50kg' },
                  { setNumber: 2, repetitions: 9, weight: '50kg' },
                  { setNumber: 3, repetitions: 8, weight: '50kg' },
                ],
              },
            },
          ],
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            ExerciseSetLog: true,
          },
        },
      },
    });

    console.log('Workout session logged successfully:', session);
    return session;
  } catch (error) {
    console.error('Error logging workout session', error);
    return { error: 'Failed to log workout session' };
  }
}

export async function getAllWorkoutSessions() {
  try {
    const sessions = await prisma.workoutSession.findMany({
      include: {
        exercises: {
          include: {
            exercise: true, // Get the exercise name
            ExerciseSetLog: true, // Get all sets for each exercise
            exerciseTemplate: true, // Include the template (planned sets & reps)
          },
        },
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  } catch (error) {
    console.error('Error fetching workout sessions', error);
    return { error: 'Failed to fetch workout sessions' };
  }
}

/**
 * Data shape we expect from the client:
 *   - templateId: The ID of the template we used (from originalWorkout.id)
 *   - date: The date/time of the workout
 *   - exercises: array of exercises done by the user
 */
interface NewWorkoutData {
  templateId: string;
  date: string;
  exercises: {
    exerciseTemplateId: string; // from original template
    exerciseId: string; // actual exercise to log
    setLogs: {
      setNumber: number;
      repetitions: number;
      weight: string;
    }[];
  }[];
}

/**
 * Creates a new workout session in the database
 */
export async function logNewWorkout(data: NewWorkoutData) {
  try {
    const { templateId, date, exercises } = data;

    const session = await prisma.workoutSession.create({
      data: {
        templateId,
        date,
        isCompleted: true, // or false if you only mark it complete later
        exercises: {
          create: exercises.map((ex) => ({
            exerciseTemplateId: ex.exerciseTemplateId,
            exerciseId: ex.exerciseId,
            sets: ex.setLogs.length,
            ExerciseSetLog: {
              create: ex.setLogs.map((setItem) => ({
                setNumber: setItem.setNumber,
                repetitions: setItem.repetitions,
                weight: setItem.weight,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            ExerciseSetLog: true,
          },
        },
      },
    });

    console.log('Workout session logged successfully:', session);
    return session;
  } catch (error) {
    console.error('Error logging workout session', error);
    return { error: 'Failed to log workout session' };
  }
}

export async function deleteSession(id: string) {
  try {
    return await prisma.workoutSession.delete({ where: { id } });
  } catch (error) {
    console.error('Error deleting workout session', error);
    return { error: 'Failed to delete workout session' };
  }
}
