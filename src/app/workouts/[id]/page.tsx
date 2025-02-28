'use client';

import { getExerciseLastSessionData } from '@/actions/exercise-actions';
import { logNewWorkout } from '@/actions/workout-sessions-actions';
import { getTemplateWorkout } from '@/actions/workout-templates-actions';
import LoadingSpinner from '@/components/loading';
import { useConfirm } from '@/hooks/useConfirm';
import clsx from 'clsx';
import { useParams, useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

interface ExerciseTemplate {
  exercise: {
    id: string;
    name: string;
  };
  id: string; // Template Exercise ID
  workoutTemplateId: string;
  exerciseId: string; // Actual DB exercise ID
  sets: number;
  repetitions: number;
  weight: string;
  rest: number;
}

interface TemplateWorkout {
  exercises: ExerciseTemplate[];
  workoutDay: number;
  workoutName: string;
  id: string; // The template's ID
}

export default function NewWorkout() {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { id } = useParams(); // This "id" is presumably the template ID
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();
  const [exerciseLogs, setExerciseLogs] = useState<
    {
      data:
        | {
            setNumber: number;
            repetitions: number;
            weight: string;
          }[]
        | null;
      exerciseId: string;
    }[]
  >([]);

  const [originalWorkout, setOriginalWorkout] =
    useState<TemplateWorkout | null>(null);

  // We'll store each exercise with its set logs
  const [workout, setWorkout] = useState<{
    date: string;
    exercises: {
      exerciseTemplateId: string;
      exerciseId: string;
      name: string;
      totalSets: number;
      reps: number;
      weight: string;
      rest: number;
      setLogs: {
        setNumber: number;
        repetitions: number;
        weight: string;
      }[];
      isDone: boolean;
    }[];
  }>({
    date: today,
    exercises: [],
  });

  /**
   * Fetch the workout template and initialize our local workout state
   */
  const getWorkoutInfo = useCallback(async () => {
    setIsLoading(true);

    if (!id) {
      setIsLoading(false);
      return;
    }

    const res = await getTemplateWorkout(String(id));
    if (!res) {
      setIsLoading(false);
      return;
    }

    setOriginalWorkout(res);

    // Build the "exercises" array for local state
    const mappedExercises = res.exercises.map((exercise) => {
      return {
        exerciseTemplateId: exercise.id, // The template's line item ID
        exerciseId: exercise.exerciseId, // The real exercise ID
        name: exercise.exercise.name,
        totalSets: exercise.sets,
        reps: exercise.repetitions,
        weight: exercise.weight,
        rest: exercise.rest,
        // Build an array of setLogs
        setLogs: Array(exercise.sets)
          .fill(null)
          .map((_, idx) => ({
            setNumber: idx + 1,
            repetitions: 0,
            weight: '',
          })),
        isDone: false,
      };
    });

    setExerciseLogs(
      await Promise.all(
        mappedExercises.map(async (exercise) => {
          const data = await getExerciseLastSessionData(exercise.exerciseId);
          return { data, exerciseId: exercise.exerciseId };
        }),
      ),
    );

    setWorkout({
      date: today,
      exercises: mappedExercises,
    });

    setIsLoading(false);
  }, [id, today]);

  useEffect(() => {
    getWorkoutInfo();
  }, [getWorkoutInfo]);

  /**
   * Handle a change in reps or weight for a specific exercise, set, etc.
   */
  const handleSetLogChange = useCallback(
    (
      exerciseId: string,
      setIndex: number,
      field: 'repetitions' | 'weight',
      value: string | number,
    ) => {
      setWorkout((prev) => {
        // map over each exercise
        const updatedExercises = prev.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex; // not the one we're editing

          const updatedSetLogs = ex.setLogs.map((setLog, i) => {
            if (i !== setIndex) return setLog;
            return {
              ...setLog,
              [field]: value, // update either reps or weight
            };
          });

          return {
            ...ex,
            setLogs: updatedSetLogs,
          };
        });

        return { ...prev, exercises: updatedExercises };
      });
    },
    [],
  );

  /**
   * Finalize the session:
   * Call the `logNewWorkout` server action with the data from local state
   */
  const handleFinishSession = async () => {
    if (!originalWorkout) return;

    const isConfirmed = await confirm({
      message: '¿Dar por terminada la sesión y registrar el entrenamiento?',
      title: 'Finalizar entrenamiento',
    });

    if (isConfirmed) {
      setIsLoading(true);

      // Build the payload that logNewWorkout expects
      await logNewWorkout({
        templateId: originalWorkout.id,
        date: workout.date || new Date().toISOString(),
        exercises: workout.exercises.map((ex) => ({
          exerciseTemplateId: ex.exerciseTemplateId,
          exerciseId: ex.exerciseId,
          setLogs: ex.setLogs.map((s) => ({
            setNumber: s.setNumber,
            repetitions: s.repetitions,
            weight: s.weight,
          })),
        })),
      });
      setIsLoading(false);
      // Possibly navigate or show a success message
      router.push('/logs');
      // alert('Workout session logged!');
    }
  };

  // const handleFinishSession = () => {
  //   if (!originalWorkout) return;

  //   console.log({
  //     templateId: originalWorkout.id,
  //     date: workout.date || new Date().toISOString(),
  //     exercises: workout.exercises.map((ex) => ({
  //       exerciseTemplateId: ex.exerciseTemplateId,
  //       exerciseId: ex.exerciseId,
  //       setLogs: ex.setLogs.map((s) => ({
  //         setNumber: s.setNumber,
  //         repetitions: s.repetitions,
  //         weight: s.weight,
  //       })),
  //     })),
  //   });
  // };

  return (
    <main className="flex flex-col gap-4">
      <LoadingSpinner isLoading={isLoading} />
      <div>
        <h2 className="font-bold tracking-wider text-3xl grow text-nowrap text-center">
          Día {originalWorkout?.workoutDay}
        </h2>
        <h2 className="text-2xl text-center">{originalWorkout?.workoutName}</h2>
      </div>

      <div className="bg-fuchsia-600 h-[2px]" />

      <div className="flex flex-col gap-2 items-center">
        <label htmlFor="workoutDate" className="text-lg font-bold">
          Fecha
        </label>
        <input
          type="date"
          id="workoutDate"
          name="workoutDate"
          className="border border-white p-2 rounded text-center w-[200px]"
          value={workout.date}
          required
          onChange={(e) =>
            setWorkout((prev) => ({ ...prev, date: e.target.value }))
          }
        />
      </div>

      <ul className="flex flex-col gap-4 md:grid md:grid-cols-3 p-3 border-b">
        {workout.exercises.map((ex, i) => (
          <div
            key={ex.exerciseTemplateId}
            className="border p-2 rounded flex gap-6"
          >
            <div className="flex flex-col gap-1 w-full">
              <p
                className={clsx(
                  'text-center text-xl tracking-wide mb-2 text-fuchsia-600',
                  ex.isDone ? 'line-through' : '',
                )}
              >
                <strong>
                  {i + 1}/{workout.exercises.length}
                </strong>
                {' - '}
                {ex.name}
              </p>
              <p
                className={clsx(
                  'text-center font-bold',
                  ex.isDone ? 'line-through' : '',
                )}
              >
                {`${ex.totalSets} x ${ex.reps} @ ${
                  ex.weight
                } - descanso ${Number(ex.rest / 60).toPrecision(1)}'`}
              </p>

              {/* 
                Render input fields for each set 
              */}
              <div className="grid grid-cols-4 gap-2 gap-x-4 max-w-full">
                {/* Labels row */}
                <div className="flex flex-col">
                  <label className="text-center font-bold">
                    <small>Set #</small>
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="text-center font-bold">
                    <small>Reps</small>
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="text-center font-bold">
                    <small>Peso</small>
                  </label>
                </div>
                <div className="flex flex-col"></div>

                {/* set rows */}
                {ex.setLogs.map((setLog, idx) => (
                  <Fragment key={`row-${idx}`}>
                    <div className="flex flex-col">
                      <small className="text-center">{setLog.setNumber}º</small>
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="tel"
                        className="w-full min-w-0 border p-1"
                        value={setLog.repetitions}
                        onChange={(e) =>
                          handleSetLogChange(
                            ex.exerciseId,
                            idx,
                            'repetitions',
                            e.target.value ? parseInt(e.target.value, 10) : 0,
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        className="w-full min-w-0 border p-1"
                        value={setLog.weight}
                        onChange={(e) =>
                          handleSetLogChange(
                            ex.exerciseId,
                            idx,
                            'weight',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <input
                        type="checkbox"
                        className="w-full min-w-0 border p-1 h-[32px] accent-fuchsia-600 "
                        checked={
                          ex.reps === setLog.repetitions &&
                          ex.weight === setLog.weight
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSetLogChange(
                              ex.exerciseId,
                              idx,
                              'repetitions',
                              ex.reps,
                            );
                            handleSetLogChange(
                              ex.exerciseId,
                              idx,
                              'weight',
                              ex.weight,
                            );
                          } else {
                            handleSetLogChange(
                              ex.exerciseId,
                              idx,
                              'repetitions',
                              0,
                            );
                            handleSetLogChange(
                              ex.exerciseId,
                              idx,
                              'repetitions',
                              0,
                            );
                            handleSetLogChange(
                              ex.exerciseId,
                              idx,
                              'weight',
                              '',
                            );
                          }
                        }}
                      />
                    </div>
                  </Fragment>
                ))}
              </div>

              {exerciseLogs.find(
                (exerciseLog) => exerciseLog.exerciseId === ex.exerciseId,
              )?.data ? (
                <div className="p-2 border rounded mx-[10%] my-4 text-stone-500 border-stone-400">
                  <p className="text-center">Última sesión</p>
                  <div className="grid-cols-3 grid justify-items-center">
                    <small className="font-bold">Set #</small>
                    <small className="font-bold">Reps</small>
                    <small className="font-bold">Peso</small>
                    {exerciseLogs
                      .find(
                        (exerciseLog) =>
                          exerciseLog.exerciseId === ex.exerciseId,
                      )
                      ?.data?.map((set) => (
                        <Fragment key={ex.exerciseId + set.setNumber}>
                          <small>{set.setNumber}º</small>
                          <small>{set.repetitions}</small>
                          <small>{set.weight}</small>
                        </Fragment>
                      ))}
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        ))}
      </ul>

      <button onClick={handleFinishSession} className="primary">
        Finalizar sesión
      </button>
      <ConfirmDialog />
    </main>
  );
}
