import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LogEntry, AircraftCategory } from '../types';

interface StatsPanelProps {
  entries: LogEntry[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ entries }) => {
  // Aggregate data
  const data = [
    {
      name: 'Training',
      count: entries.filter(e => e.aircraftCategory === AircraftCategory.TRAINING).length,
      color: '#EAB308'
    },
    {
      name: 'Combat',
      count: entries.filter(e => e.aircraftCategory === AircraftCategory.FIGHTER).length,
      color: '#DC2626'
    },
    {
      name: 'Ferry',
      count: entries.filter(e => e.aircraftCategory === AircraftCategory.TRANSPORT).length,
      color: '#3B82F6'
    }
  ];

  return (
    <div className="bg-white p-4 border-t border-stone-300 h-48 flex flex-col shadow-inner">
      <h3 className="text-sm font-bold text-stone-600 mb-2 uppercase tracking-wider">Mission Profile Summary</h3>
      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={60} tick={{fill: '#475569', fontSize: 10, fontFamily: 'serif'}} />
            <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontFamily: 'serif' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPanel;