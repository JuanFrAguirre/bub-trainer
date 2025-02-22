'use client';

import { createWorkoutTemplate } from '@/actions/workouts-actions';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { v4 } from 'uuid';

interface Excercise {
  id: string;
  name: string;
  sets: string;
  repetitions: string;
  weight: string;
  rest: string;
}

const AddWorkoutPage = () => {
  const createWorkoutRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [workoutDay, setWorkoutDay] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Excercise[]>([]);

  const handleExerciseChange = useCallback(
    (id: string, field: string, value: string) => {
      setExercises(
        [...exercises].map((exercise) =>
          exercise.id !== id ? exercise : { ...exercise, [field]: value },
        ),
      );
    },
    [exercises],
  );

  const addExercise = useCallback(() => {
    setExercises([
      ...exercises,
      {
        id: v4(),
        name: '',
        sets: '',
        repetitions: '',
        weight: '',
        rest: '',
      },
    ]);
  }, [exercises]);

  const removeExercise = useCallback(
    (id: string) => {
      setExercises(exercises.filter((excercise) => id !== excercise.id));
    },
    [exercises],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const workoutData = {
        workoutDay,
        exercises,
      };

      console.log(JSON.stringify(workoutData, null, 2));
      const res = await createWorkoutTemplate({
        workoutDay: Number(workoutDay),
        workoutName,
        exercises: [
          ...exercises.map((exercise) => ({
            name: exercise.name,
            weight: exercise.weight,
            sets: Number(exercise.sets),
            repetitions: Number(exercise.repetitions),
            rest: Number(exercise.rest),
          })),
        ],
      });

      console.log(JSON.stringify(res, null, 2));
      createWorkoutRef.current?.reset();
      router.push('/templates');
    },
    [exercises, workoutDay, workoutName, router],
  );

  useEffect(() => {
    setExercises([
      {
        id: v4(),
        name: '',
        sets: '',
        repetitions: '',
        weight: '',
        rest: '',
      },
    ]);
  }, []);

  return (
    <section className="mb-20">
      <h2 className="text-center font-bold text-2xl">
        Crear una nueva plantilla
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        ref={createWorkoutRef}
      >
        {/* Workout Data */}
        <div className="flex flex-col">
          <label htmlFor="workoutDay">Día</label>
          <div className="flex gap-4">
            <button
              onClick={() => setWorkoutDay('1')}
              type="button"
              className={clsx('grow', workoutDay === '1' && 'primary')}
            >
              1
            </button>
            <button
              onClick={() => setWorkoutDay('2')}
              type="button"
              className={clsx('grow', workoutDay === '2' && 'primary')}
            >
              2
            </button>
            <button
              onClick={() => setWorkoutDay('3')}
              type="button"
              className={clsx('grow', workoutDay === '3' && 'primary')}
            >
              3
            </button>
            <button
              onClick={() => setWorkoutDay('4')}
              type="button"
              className={clsx('grow', workoutDay === '4' && 'primary')}
            >
              4
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="workoutName">Nombre del entreno</label>
          <input
            className="bg-black border border-white rounded p-2"
            type="text"
            id={'workoutName'}
            value={workoutName}
            required
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>

        {/* Exercise List */}
        {exercises.map((exercise, i) => (
          <div key={exercise.id} className="flex flex-col border-t pt-2">
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
            <label htmlFor={exercise.id + 'name'}>
              <small>Descripción</small>
            </label>
            <input
              className="bg-black border border-white rounded p-2"
              type="text"
              id={exercise.id + 'name'}
              value={exercise.name}
              required
              onChange={(e) =>
                handleExerciseChange(exercise.id, 'name', e.target.value)
              }
            />
            <div className="grid grid-cols-4 gap-x-2 gap-y-1 my-1 items-end">
              <label htmlFor={exercise.id + 'sets'} className="leading-none">
                <small>Sets</small>
              </label>
              <label htmlFor={exercise.id + 'reps'} className="leading-none">
                <small>Reps</small>
              </label>
              <label htmlFor={exercise.id + 'weight'} className="leading-none">
                <small>Peso</small>
              </label>
              <label htmlFor={exercise.id + 'rest'} className="leading-none">
                <small>Descanso (segundos)</small>
              </label>
              <input
                className="bg-black border border-white rounded"
                type="number"
                step={0.1}
                min={0}
                value={exercise.sets}
                id={exercise.id + 'sets'}
                required
                onChange={(e) =>
                  handleExerciseChange(exercise.id, 'sets', e.target.value)
                }
              />
              <input
                className="bg-black border border-white rounded"
                type="number"
                step={0.1}
                min={0}
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
                  handleExerciseChange(exercise.id, 'weight', e.target.value)
                }
              />
              <input
                className="bg-black border border-white rounded"
                type="number"
                step={0.1}
                min={0}
                value={exercise.rest}
                id={exercise.id + 'rest'}
                onChange={(e) =>
                  handleExerciseChange(exercise.id, 'rest', e.target.value)
                }
              />
            </div>
          </div>
        ))}

        {/* Add Exercise Button */}
        <button type="button" onClick={addExercise} className="secondary">
          + Agregar ejercicio
        </button>

        {/* Submit Button */}
        <div className="flex justify-center gap-4">
          <button className="tertiary basis-1/2" type="button">
            Cancelar
          </button>
          <button
            className="bg-white text-black px-3 py-1 rounded basis-1/2"
            type="submit"
          >
            Crear
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddWorkoutPage;
