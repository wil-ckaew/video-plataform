// components/Alert.tsx
import React from 'react';

interface AlertProps {
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div className="bg-red-500 text-white p-4 rounded mb-4">
      {message}
    </div>
  );
};

export default Alert;
