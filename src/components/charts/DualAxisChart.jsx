import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DualAxisChart = ({ bitcoinData = [], m2Data = [], timeRange }) => {
  // Sample data for testing
  const sampleData = [
    { date: new Date('2024-01-01'), bitcoin: 45000, m2: 21.5 },
    { date: new Date('2024-01-02'), bitcoin: 46000, m2: 21.6 },
    { date: new Date('2024-01-03'), bitcoin: 47000, m2: 21.7 },
    { date: new Date('2024-01-04'), bitcoin: 48000, m2: 21.8 },
    { date: new Date('2024-01-05'), bitcoin: 49000, m2: 21.9 },
  ];

  const formatBitcoin = (value) => `$${(value / 1000).toFixed(0)}k`;
  const formatM2 = (value) => `$${value.toFixed(1)}T`;

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Bitcoin Price vs M2 Money Supply</h2>
      </div>
      
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={sampleData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          
          <YAxis
            yAxisId="bitcoin"
            orientation="left"
            tickFormatter={formatBitcoin}
            stroke="#F59E0B"
            tick={{ fill: '#F59E0B', fontSize: 12 }}
          />
          
          <YAxis
            yAxisId="m2"
            orientation="right"
            tickFormatter={formatM2}
            stroke="#10B981"
            tick={{ fill: '#10B981', fontSize: 12 }}
          />
          
          <Tooltip />
          <Legend />
          
          <Line
            yAxisId="bitcoin"
            type="monotone"
            dataKey="bitcoin"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={false}
            name="Bitcoin Price"
          />
          
          <Line
            yAxisId="m2"
            type="monotone"
            dataKey="m2"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            name="M2 Money Supply"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DualAxisChart;
