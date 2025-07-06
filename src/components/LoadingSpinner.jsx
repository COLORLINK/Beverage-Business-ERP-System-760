import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-2 border-t-transparent border-primary-600 ${sizeClasses[size]} mx-auto`} />
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;