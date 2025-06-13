import React from 'react';
import { BarChart3, Table, TrendingUp } from 'lucide-react';

const ViewSelector = ({ currentView, onViewChange }) => {
  const views = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Charts and visualizations'
    },
    {
      id: 'table',
      name: 'Table',
      icon: Table,
      description: 'Data in tabular format'
    },
    {
      id: 'summary',
      name: 'Summary',
      icon: TrendingUp,
      description: 'Key metrics overview'
    }
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
            title={view.description}
          >
            <Icon size={18} />
            <span className="font-medium">{view.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewSelector;