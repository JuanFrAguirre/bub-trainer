'use server';
import { getExercises } from '@/actions/exercise-actions';
import CreateExercise from './createExercise';

const Exercises = async () => {
  const exercises = await getExercises();

  return (
    <main className="space-y-8 relative">
      <CreateExercise />
      <h2 className="text-center font-bold text-2xl">Ejercicios</h2>
      <ul className="grid grid-cols-2 gap-4">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="border rounded p-2">
            {exercise.name}
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Exercises;
