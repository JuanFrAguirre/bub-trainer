'use client';
import {
  deleteSession,
  getAllWorkoutSessions,
} from '@/actions/workout-sessions-actions'; // Import fetch action
import LoadingSpinner from '@/components/loading';
import { useConfirm } from '@/hooks/useConfirm';
import '@github/relative-time-element';
import { useCallback, useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';

interface WorkoutTemplate {
  id: string;
  workoutDay: number;
  workoutName: string;
  // You can add more fields if needed, e.g., exercises, createdAt, etc.
}

type WorkoutSession = {
  id: string;
  templateId: string;
  template: WorkoutTemplate;
  date: string;
  isCompleted: boolean;
  createdAt: Date;
  exercises: {
    id: string;
    exercise: { id: string; name: string };
    sets: number;
    rest: number;
    ExerciseSetLog: {
      id: string;
      setNumber: number;
      repetitions: number;
      weight: string;
    }[];
    exerciseTemplate: {
      sets: number;
      repetitions: number;
      weight: string;
    };
  }[];
};

export default function TestWorkoutLogger() {
  const [sessions, setSessions] = useState<
    WorkoutSession[] | { error: string } | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const handleFetchSessions = useCallback(async () => {
    setIsLoading(true);
    const res = await getAllWorkoutSessions();

    if ('error' in res) {
      setSessions(res);
    } else {
      // Ensure exercises contain exerciseTemplate
      const formattedSessions = res.map((session) => ({
        ...session,
        exercises: session.exercises.map((exercise) => ({
          ...exercise,
          exerciseTemplate: {
            sets: exercise.sets,
            repetitions: exercise.ExerciseSetLog?.[0]?.repetitions || 0,
            weight: exercise.exerciseTemplate.weight || '',
          },
        })),
      }));
      setSessions(formattedSessions);
    }
    setIsLoading(false);
  }, []);

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        const isConfirmed = await confirm({
          title: 'Eliminar sesión',
          message: '¿Estás seguro de que deseas eliminar esta sesión?',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
        });
        setIsLoading(true);
        if (isConfirmed) {
          await deleteSession(id);
          setSessions((prev) =>
            Array.isArray(prev)
              ? prev.filter((session) => session.id !== id)
              : prev,
          );
        }
      } catch (error) {
        console.error(error);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    },
    [confirm],
  );

  useEffect(() => {
    handleFetchSessions();
  }, [handleFetchSessions]);

  return (
    <div>
      <LoadingSpinner isLoading={isLoading} />
      {!isLoading && sessions && (
        <div>
          <h3 className="py-4 px-2 text-xl font-black text-center">
            Registros
          </h3>
          <div className="flex flex-col gap-4">
            {Array.isArray(sessions) ? (
              sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="border p-3 rounded">
                    <div className="pb-4">
                      <p className="text-center text-lg font-bold">
                        Día {session.template.workoutDay}
                      </p>
                      <p className="text-center text-lg font-bold text-fuchsia-600">
                        {session.template.workoutName}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-between gap-y-3">
                      {session.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-2 border rounded basis-[48%] flex flex-col justify-between gap-2 items-center"
                        >
                          <div className="flex flex-col gap-2">
                            <p className="font-bold text-center text-lg">
                              {exercise.exercise.name}
                            </p>
                            <p className="text-center">
                              {exercise.sets} x{' '}
                              {exercise.exerciseTemplate.repetitions} @{' '}
                              {exercise.exerciseTemplate.weight}
                            </p>
                          </div>
                          <ul className="pb-2">
                            {exercise.ExerciseSetLog.map((set) => (
                              <li
                                key={set.id}
                                className="border-b first:border-t p-[2px]"
                              >
                                <small className="text-center block">
                                  Set {set.setNumber}: {set.repetitions} reps @{' '}
                                  {set.weight}
                                </small>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end items-center mt-4 gap-4">
                      <p className="text-end">
                        {/* @ts-expect-error external component */}
                        <relative-time
                          lang="es"
                          datetime={new Date(session.date).toISOString()}
                          format="relative"
                        >
                          {new Date(session.date).toLocaleDateString()}
                          {/* @ts-expect-error external component */}
                        </relative-time>
                      </p>
                      <button
                        className=""
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 px-2 text-xl text-center font-black">
                  No hay sesiones registradas
                </div>
              )
            ) : (
              <p>Error fetching sessions: {sessions.error}</p>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
