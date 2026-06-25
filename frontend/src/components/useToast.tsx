import { useState } from 'react';
import Toast, { ToastStatus } from './Toast';

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    status: ToastStatus;
    duration?: number;
  } | null>(null);

  const showToast = (message: string, status: ToastStatus, duration?: number) => {
    setToast({ message, status, duration });
  };

  const hideToast = () => {
    setToast(null);
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      status={toast.status}
      duration={toast.duration}
      onClose={hideToast}
    />
  ) : null;

  return {
    showToast,
    ToastComponent,
  };
}

