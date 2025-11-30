import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  onHide,
  duration = 3000
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide, duration]);

  if (!visible) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
};

