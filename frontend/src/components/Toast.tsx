import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import './Toast.css';

export type ToastStatus = 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  status: ToastStatus;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, status, duration = 3, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade-out animation
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="toast-icon toast-icon-success" />;
      case 'warning':
        return <AlertTriangle className="toast-icon toast-icon-warning" />;
      case 'error':
        return <XCircle className="toast-icon toast-icon-error" />;
      default:
        return null;
    }
  };

  return (
    <div className={`toast ${isVisible ? 'toast-visible' : ''}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

