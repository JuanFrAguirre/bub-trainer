import { getTemplateWorkouts } from '@/actions/workouts-actions';

export default async function Home() {
  const workouts = await getTemplateWorkouts();

  return (
    <>
      <main>
        <div className="flex flex-col">
          <ul className="flex flex-col gap-4 p-4">
            {workouts.map((workout) => (
              <li
                key={workout.id}
                className="p-4 border rounded border-white/25 flex flex-col"
              >
                <p className="text-xl font-bold text-center mb-2 border-b-2 pb-2 border-b-fuchsia-600">
                  Día {workout.workoutDay} | {workout.workoutName}
                </p>
                <div className="flex">
                  <ul className="flex flex-col gap-2 grow">
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id}>
                        <p className="text-lg font-bold">
                          {exercise.exercise.name}
                        </p>
                        <p>{`${exercise.sets} x ${exercise.repetitions} ${
                          exercise.weight ? `@ ${exercise.weight}` : ''
                        }
                        ${
                          exercise.rest
                            ? ` / ${Number(exercise.rest) / 60}'`
                            : ''
                        }`}</p>
                      </div>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
