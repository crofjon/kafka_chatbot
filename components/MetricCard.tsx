
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, trend, icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-slate-400 text-sm font-medium">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={`mt-4 flex items-center text-sm ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          <span className="mr-1">{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% vs last hr</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
