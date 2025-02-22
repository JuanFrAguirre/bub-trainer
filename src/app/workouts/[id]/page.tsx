'use client';
import { getTemplateWorkout } from '@/actions/workouts-actions';
import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Workout {
  exercises: {
    exercise: {
      id: string;
      name: string;
    };
    id: string;
    workoutTemplateId: string;
    exerciseId: string;
    sets: number;
    repetitions: number;
    weight: string;
    rest: number;
  }[];
  workoutDay: number;
  workoutName: string;
}

interface Exercise {
  exercise: {
    id: string;
    name: string;
  };
  id: string;
  workoutTemplateId: string;
  exerciseId: string;
  sets: number;
  repetitions: number;
  weight: string;
  rest: number;
}

export default function NewWorkout() {
  const params = useParams();
  const { id } = params;

  const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(null);
  const [workout, setWorkout] = useState<{
    date: string;
    exercises: {
      name: string;
      id: string;
      sets: number;
      repetitions: number;
      weight: string;
      isDone: boolean;
    }[];
  }>({ date: '', exercises: [] });

  const getWorkoutInfo = useCallback(async () => {
    if (!id) return;
    const res = await getTemplateWorkout(String(id));
    setOriginalWorkout(res);
    setWorkout((prev) => ({
      ...prev,
      exercises:
        res?.exercises.map((exercise) => ({
          name: exercise.exercise.name,
          id: exercise.exerciseId,
          sets: 0,
          repetitions: 0,
          weight: '',
          isDone: false,
        })) || [],
    }));
  }, [id]);

  const getWorkoutIsDone = useCallback(
    (exercise: Exercise) => {
      if (!exercise.exerciseId) return;
      return workout.exercises.find((ex) => exercise.exerciseId === ex.id)
        ?.isDone;
    },
    [workout],
  );

  useEffect(() => {
    getWorkoutInfo();
  }, [getWorkoutInfo]);

  if (!originalWorkout) return <p>Loading...</p>;

  return (
    <main className="flex flex-col gap-6">
      {/* {JSON.stringify(originalWorkout, undefined, 2)} */}
      <h2 className="font-bold text-2xl grow text-nowrap text-center">
        Día {originalWorkout?.workoutDay}
      </h2>
      <h2 className="font-bold text-2xl text-center">
        {originalWorkout?.workoutName}
      </h2>
      <div className="bg-fuchsia-600 h-[2px]"></div>
      <ul className="space-y-4">
        {originalWorkout?.exercises.map((exercise) => (
          <div key={exercise.id} className="border p-2 rounded flex gap-6">
            <div className=" space-y-1">
              <p
                className={clsx(
                  'text-center font-bold mb-2',
                  getWorkoutIsDone(exercise) ? 'line-through' : '',
                )}
              >
                {exercise.exercise.name}
              </p>
              <p
                className={clsx(
                  'text-center font-bold',
                  getWorkoutIsDone(exercise) ? 'line-through' : '',
                )}
              >
                {`${exercise.sets} x ${exercise.repetitions} ${
                  exercise.weight ? ` @ ${exercise.weight}` : ''
                } ${
                  exercise.rest
                    ? ` - descanso ${Number(
                        Number(exercise.rest) / 60,
                      ).toPrecision(1)}'`
                    : ''
                }`}
              </p>
              <div className="grid grid-cols-3 gap-2 gap-x-4 max-w-full">
                {/* 1er fila */}
                <div className="flex flex-col">
                  <label className="text-center">
                    <small>Sets</small>
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="text-center">
                    <small>Reps</small>
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="text-center">
                    <small>Peso</small>
                  </label>
                </div>

                {/* 2da fila */}
                {Array(exercise.sets)
                  .fill(null)
                  .map((_, i) => (
                    <>
                      <div className="flex flex-col">
                        <label className="">
                          <small>{i + 1}º set</small>
                        </label>
                      </div>
                      <div className="flex flex-col">
                        <input type="tel" className="w-full min-w-0" />
                      </div>
                      <div className="flex flex-col">
                        <input type="text" className="w-full min-w-0" />
                      </div>
                    </>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </ul>
      <button className="primary">Finalizar sesión</button>
    </main>
  );
}
