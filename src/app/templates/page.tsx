import { getTemplateWorkouts } from '@/actions/workout-templates-actions';
import TemplateWorkoutItem from './templateWorkoutItem';

export default async function Templates() {
  const workouts = await getTemplateWorkouts();

  const transformedWorkouts = workouts.map((workout) => ({
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.exercise.name,
      sets: exercise.sets,
      repetitions: exercise.repetitions,
      weight: exercise.weight,
      rest: exercise.rest,
    })),
  }));

  return (
    <>
      <main>
        <div className="flex flex-col">
          <ul className="flex flex-col gap-4 p-4">
            {transformedWorkouts.map((workout) => (
              <TemplateWorkoutItem workout={workout} key={workout.id} />
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
