'use client';

import { getExercises } from '@/actions/exercise-actions';
import {
  deleteWorkoutTemplate,
  updateWorkoutTemplate,
} from '@/actions/workouts-actions';
import Modal from '@/components/modal';
import { useConfirm } from '@/hooks/useConfirm';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { FaEdit, FaRegTrashAlt, FaTrashAlt } from 'react-icons/fa';
import { v4 } from 'uuid';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  repetitions: number;
  weight: string;
  rest: number;
}

interface PrismaExercise {
  name: string;
  id: string;
}

interface Workout {
  exercises: Exercise[];
  id: string;
  workoutDay: number;
  workoutName: string;
  createdAt: Date;
}

interface Props {
  workout: Workout;
}

const TemplateWorkoutItem: FC<Props> = ({ workout }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [workoutDay, setWorkoutDay] = useState(workout.workoutDay.toString());
  const [exercises, setExercises] = useState<Exercise[]>(workout.exercises);
  const [excercisePool, setExcercisePool] = useState<PrismaExercise[]>([]);
  const [isNewExerciseModalOpen, setIsNewExerciseModalOpen] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();
  const editWorkoutRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  /** Handle Exercise Field Change */
  const handleExerciseChange = useCallback(
    (id: string, field: string, value: string) => {
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === id ? { ...exercise, [field]: value } : exercise,
        ),
      );
    },
    [],
  );

  /** Add a New Exercise */
  const addExercise = useCallback(() => {
    setExercises((prev) => [
      ...prev,
      {
        id: v4(),
        name: '',
        sets: 0,
        repetitions: 0,
        weight: '',
        rest: 0,
      },
    ]);
  }, []);

  const handleDeleteWorkout = useCallback(
    async (workoutId: string) => {
      const isConfirmed = await confirm({
        title: 'Eliminar plantilla',
        message: '¿Estás seguro de que deseas eliminar esta plantilla?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      });

      if (isConfirmed) {
        await deleteWorkoutTemplate(workoutId);
        router.refresh();
      }
    },
    [confirm, router],
  );

  const handleCancelEdit = useCallback(() => {
    editWorkoutRef.current?.reset();
    setIsEditOpen(false);
    setExercises(workout.exercises);
    router.refresh();
  }, [router, workout.exercises]);

  const removeExercise = useCallback(
    async (id: string) => {
      const isConfirmed = await confirm({
        title: 'Eliminar ejercicio',
        message: '¿Estás seguro de que deseas eliminar este ejercicio?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      });

      if (isConfirmed) {
        setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
      }
    },
    [confirm],
  );

  /** Handle Workout Update */
  const handleUpdate = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const updatedWorkout = {
        id: workout.id,
        workoutDay: Number(workoutDay),
        exercises: exercises.map((exercise) => ({
          ...exercise,
          sets: Number(exercise.sets),
          repetitions: Number(exercise.repetitions),
          rest: Number(exercise.rest),
        })),
      };

      setIsEditOpen(false);
      editWorkoutRef.current?.reset();
      console.log(JSON.stringify(updatedWorkout, null, 2));
      await updateWorkoutTemplate(updatedWorkout.id, updatedWorkout);
      router.refresh();
    },
    [workout.id, workoutDay, exercises, router],
  );

  useEffect(() => {
    const populateExercisePool = async () => {
      const exercisesFromDB = await getExercises();
      setExcercisePool(exercisesFromDB);
    };
    populateExercisePool();
  }, []);

  return (
    <>
      <li className="p-4 border rounded border-white/25 flex">
        <div className="grow">
          <p className="text-xl font-bold">
            Día {workout.workoutDay} | {workout.workoutName}
          </p>
          <ul className="flex flex-col gap-2">
            {workout.exercises.map((exercise) => (
              <div key={exercise.id}>
                <p className="text-lg font-bold">{exercise.name}</p>
                <p>{`${exercise.sets} x ${exercise.repetitions} ${
                  exercise.weight ? `@ ${exercise.weight}` : ''
                }
              ${
                exercise.rest
                  ? ` / ${Number(Number(exercise.rest) / 60).toPrecision(1)}'`
                  : ''
              }`}</p>
              </div>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <button
            className="p-1 text-xl border-none self-start"
            onClick={() => setIsEditOpen(true)}
          >
            <FaEdit />
          </button>
          <button
            className="p-1 text-xl border-none self-start"
            onClick={() => handleDeleteWorkout(workout.id)}
          >
            <FaTrashAlt />
          </button>
        </div>

        {/* Edit Modal */}
        {isEditOpen && (
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
            <section className="mb-4">
              <h2 className="text-center font-bold text-2xl">
                Editar plantilla
              </h2>
              <form
                onSubmit={handleUpdate}
                className="flex flex-col gap-4"
                ref={editWorkoutRef}
              >
                {/* Workout Day Selection */}
                <div className="flex flex-col">
                  <label htmlFor="workoutDay">Día</label>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setWorkoutDay(day.toString())}
                        className={clsx(
                          'grow',
                          workoutDay === day.toString() && 'primary',
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercise List */}
                {exercises.map((exercise, i) => (
                  <div
                    key={exercise.id}
                    className="flex flex-col border-t pt-2"
                  >
                    <div className="flex justify-center items-center relative mt-2">
                      <p className="font-bold text-lg pt-1 text-center">
                        Ejercicio {i + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        className="secondary absolute top-0 right-0 bottom-0"
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>

                    {/* Exercise name */}

                    <label htmlFor={exercise.id + 'name'}>
                      <small>Nombre</small>
                    </label>
                    <select
                      name={exercise.id + 'name'}
                      id={exercise.id + 'name'}
                      className="bg-black border border-white rounded p-2"
                      required
                      value={exercise.name}
                      onChange={(e) =>
                        handleExerciseChange(
                          exercise.id,
                          'name',
                          e.target.value,
                        )
                      }
                    >
                      <option value="">-- Selecciona un ejercicio --</option>
                      {excercisePool.map((ex) => (
                        <option value={ex.name} key={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-4 gap-x-2 gap-y-1 my-1 items-end">
                      <label
                        htmlFor={exercise.id + 'sets'}
                        className="leading-none"
                      >
                        <small>Sets</small>
                      </label>
                      <label
                        htmlFor={exercise.id + 'reps'}
                        className="leading-none"
                      >
                        <small>Reps</small>
                      </label>
                      <label
                        htmlFor={exercise.id + 'weight'}
                        className="leading-none"
                      >
                        <small>Peso</small>
                      </label>
                      <label
                        htmlFor={exercise.id + 'rest'}
                        className="leading-none"
                      >
                        <small>Descanso (segundos)</small>
                      </label>

                      <input
                        className="bg-black border border-white rounded"
                        type="number"
                        value={exercise.sets}
                        id={exercise.id + 'sets'}
                        required
                        onChange={(e) =>
                          handleExerciseChange(
                            exercise.id,
                            'sets',
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="bg-black border border-white rounded"
                        type="number"
                        value={exercise.repetitions}
                        id={exercise.id + 'reps'}
                        required
                        onChange={(e) =>
                          handleExerciseChange(
                            exercise.id,
                            'repetitions',
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="bg-black border border-white rounded"
                        type="text"
                        value={exercise.weight}
                        id={exercise.id + 'weight'}
                        onChange={(e) =>
                          handleExerciseChange(
                            exercise.id,
                            'weight',
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="bg-black border border-white rounded"
                        type="number"
                        value={exercise.rest}
                        id={exercise.id + 'rest'}
                        onChange={(e) =>
                          handleExerciseChange(
                            exercise.id,
                            'rest',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}

                {/* Add Exercise Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={addExercise}
                    className="grow basis-1/2"
                  >
                    Agregar ejercicio
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewExerciseModalOpen(true)}
                    className="grow basis-1/2"
                  >
                    Crear nuevo
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  className="bg-white text-black px-3 py-1 rounded w-full"
                  type="submit"
                >
                  Guardar cambios
                </button>
                <button
                  className="bg-white text-black px-3 py-1 rounded w-full"
                  type="button"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              </form>
            </section>
          </Modal>
        )}

        {isNewExerciseModalOpen && (
          <Modal
            isOpen={isNewExerciseModalOpen}
            onClose={() => setIsNewExerciseModalOpen(false)}
          >
            <section className="mb-4">
              <h2 className="text-center font-bold text-2xl">
                Crear nuevo ejercicio
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const newExerciseName = formData.get(
                    'exerciseName',
                  ) as string;

                  if (!newExerciseName.trim()) return;

                  // Call API or action to create the exercise
                  const newExercise = { id: v4(), name: newExerciseName }; // Replace with real API call
                  setExcercisePool((prev) => [...prev, newExercise]);

                  setExercises((prev) => [
                    ...prev,
                    {
                      id: v4(),
                      name: newExercise.name, // ✅ Automatically select the new exercise
                      sets: 0,
                      repetitions: 0,
                      weight: '',
                      rest: 0,
                    },
                  ]);

                  // Close the modal
                  setIsNewExerciseModalOpen(false);
                }}
                className="flex flex-col gap-4"
              >
                <label htmlFor="exerciseName">
                  <small>Nombre del ejercicio</small>
                </label>
                <input
                  className="bg-black border border-white rounded p-2"
                  type="text"
                  name="exerciseName"
                  id="exerciseName"
                  required
                />

                <button type="submit" className="primary w-full">
                  Guardar
                </button>
                <button
                  type="button"
                  className="secondary w-full"
                  onClick={() => setIsNewExerciseModalOpen(false)}
                >
                  Cancelar
                </button>
              </form>
            </section>
          </Modal>
        )}
      </li>
      <ConfirmDialog />
    </>
  );
};

export default TemplateWorkoutItem;
