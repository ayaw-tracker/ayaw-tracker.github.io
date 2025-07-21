import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-4xl text-gray-400">{icon}</div>}
    <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
    {description && <p className="text-sm text-gray-500">{description}</p>}
  </div>
);