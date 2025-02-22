import React, { useState } from 'react';
import Modal from '@/components/modal';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  ConfirmDialog: () => React.JSX.Element | null;
} {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ isOpen: true, options, resolve });
    });
  };

  const handleClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return {
    confirm,
    ConfirmDialog: () =>
      confirmState?.isOpen ? (
        <Modal isOpen={confirmState.isOpen} onClose={() => handleClose(false)}>
          <div className="p-4 text-center flex flex-col justify-between bg-red-400">
            <h2 className="text-xl font-bold">
              {confirmState.options.title || 'Confirm'}
            </h2>
            <p className="my-4">
              {confirmState.options.message || 'Are you sure?'}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button className="secondary" onClick={() => handleClose(false)}>
                {confirmState.options.cancelText || 'Cancel'}
              </button>
              <button
                className="bg-white text-black px-3 py-1 rounded"
                onClick={() => handleClose(true)}
              >
                {confirmState.options.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </Modal>
      ) : null,
  };
}
