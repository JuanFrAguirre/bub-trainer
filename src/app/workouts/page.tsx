import { getTemplateWorkouts } from '@/actions/workout-templates-actions';
import Link from 'next/link';
import { FaDumbbell } from 'react-icons/fa6';

export default async function Home() {
  const workouts = await getTemplateWorkouts();

  return (
    <>
      <main>
        <div className="flex flex-col">
          <ul className="flex flex-col gap-4 p-4 md:grid md:grid-cols-2">
            {workouts.map((workout) => (
              <li
                key={workout.id}
                className="p-4 border rounded border-white/25 flex flex-col"
              >
                <p className="text-xl font-bold text-center mb-4 border-b-2 pb-2 border-b-fuchsia-600">
                  Día {workout.workoutDay} | {workout.workoutName}
                </p>
                <div className="flex grow">
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
                  {/* <div className="grow"> */}
                  <Link
                    href={'/workouts/' + workout.id}
                    className="btn !px-1.5 text-base primary flex flex-col items-center self-end"
                  >
                    <small>Entrenar</small>
                    <FaDumbbell />
                  </Link>
                  {/* </div> */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
