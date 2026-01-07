import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AttendanceStatus } from '../types';

interface StatsCardProps {
  counts: Record<AttendanceStatus, number>;
  total: number;
}

const COLORS = {
  [AttendanceStatus.HADIR]: '#10B981', // Emerald 500
  [AttendanceStatus.SAKIT]: '#F59E0B', // Amber 500
  [AttendanceStatus.IZIN]: '#3B82F6',  // Blue 500
  [AttendanceStatus.ALPA]: '#EF4444',  // Red 500
};

const StatsCard: React.FC<StatsCardProps> = ({ counts, total }) => {
  const data = useMemo(() => {
    return Object.values(AttendanceStatus).map((status) => ({
      name: status,
      value: counts[status] || 0,
    }));
  }, [counts]);

  const presentPercentage = total > 0 
    ? Math.round(((counts[AttendanceStatus.HADIR] || 0) / total) * 100) 
    : 0;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Ringkasan Hari Ini</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {total} Siswa Total
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as AttendanceStatus]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-700">Kehadiran</span>
              <span className="text-2xl font-bold text-green-700">{presentPercentage}%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
               <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-gray-500">Sakit</div>
                  <div className="text-lg font-semibold text-gray-800">{counts[AttendanceStatus.SAKIT]}</div>
               </div>
               <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-gray-500">Izin</div>
                  <div className="text-lg font-semibold text-gray-800">{counts[AttendanceStatus.IZIN]}</div>
               </div>
               <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-gray-500">Alpa</div>
                  <div className="text-lg font-semibold text-gray-800">{counts[AttendanceStatus.ALPA]}</div>
               </div>
               <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-gray-500">Belum Absen</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {total - (counts[AttendanceStatus.HADIR] + counts[AttendanceStatus.SAKIT] + counts[AttendanceStatus.IZIN] + counts[AttendanceStatus.ALPA])}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;