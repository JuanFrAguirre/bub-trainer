'use client';
import clsx from 'clsx';
import Portal from './portal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={clsx(
            'border bg-[#0a0a0a] border-white p-6 rounded-lg shadow-lg max-xl:max-w-[80%] max-xl:w-[80%] xl:max-w-screen-lg max-h-[80%] overflow-y-auto pb-20',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
