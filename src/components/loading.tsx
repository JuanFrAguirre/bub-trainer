import Portal from './portal';

interface LoadingProps {
  isLoading: boolean;
}

const LoadingSpinner: React.FC<LoadingProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Portal>
      <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
        <div className="flex flex-col items-center bg-black p-6 rounded-lg shadow-lg">
          <div className="w-12 h-12 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    </Portal>
  );
};

export default LoadingSpinner;
