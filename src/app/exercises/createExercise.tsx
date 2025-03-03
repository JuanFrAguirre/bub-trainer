'use client';
import { createExercise } from '@/actions/exercise-actions';
import LoadingSpinner from '@/components/loading';
import Modal from '@/components/modal';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

const CreateExercise = () => {
  const [isNewExerciseModalOpen, setIsNewExerciseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isNewExerciseModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isNewExerciseModalOpen]);

  return (
    <div className="absolute top-0 right-0">
      <LoadingSpinner isLoading={isLoading} />
      <button className="p-2" onClick={() => setIsNewExerciseModalOpen(true)}>
        <FaPlus />
      </button>
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
                setIsLoading(true);
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const newExerciseName = formData.get('exerciseName') as string;

                if (!newExerciseName.trim()) return;

                // Close the modal
                setIsNewExerciseModalOpen(false);
                await createExercise(newExerciseName);
                setIsLoading(false);
                router.refresh();
              }}
              className="flex flex-col gap-4"
            >
              <label htmlFor="exerciseName">
                <small>Nombre del ejercicio</small>
              </label>
              <input
                ref={inputRef}
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
    </div>
  );
};

export default CreateExercise;
