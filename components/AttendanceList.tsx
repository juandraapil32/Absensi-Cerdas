import React from 'react';
import { Student, AttendanceStatus, AttendanceRecord } from '../types';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface AttendanceListProps {
  students: Student[];
  attendance: Record<string, AttendanceRecord>;
  onMark: (studentId: string, status: AttendanceStatus, note?: string) => void;
}

const statusConfig = {
  [AttendanceStatus.HADIR]: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  [AttendanceStatus.SAKIT]: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  [AttendanceStatus.IZIN]: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  [AttendanceStatus.ALPA]: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const AttendanceList: React.FC<AttendanceListProps> = ({ students, attendance, onMark }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {students.map((student) => {
          const record = attendance[student.id];
          const currentStatus = record?.status;

          return (
            <li key={student.id} className="bg-white hover:bg-gray-50 transition duration-150 ease-in-out">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600 truncate">{student.name}</p>
                    <p className="flex items-center text-sm text-gray-500">
                      NIS: {student.nis}
                    </p>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    {Object.values(AttendanceStatus).map((status) => {
                       const Config = statusConfig[status];
                       const isActive = currentStatus === status;
                       
                       return (
                        <button
                          key={status}
                          onClick={() => onMark(student.id, status)}
                          className={`
                            relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
                            ${isActive ? `${Config.bg} ${Config.border} ring-2 ring-indigo-500 ring-offset-1` : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-400'}
                          `}
                          title={status}
                        >
                          <Config.icon className={`h-6 w-6 ${isActive ? Config.color : ''}`} />
                          <span className={`text-[10px] font-medium mt-1 ${isActive ? Config.color : 'text-gray-400'}`}>
                            {status}
                          </span>
                        </button>
                       );
                    })}
                  </div>
                </div>
                {/* Optional Note Input */}
                {(currentStatus === AttendanceStatus.SAKIT || currentStatus === AttendanceStatus.IZIN) && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Keterangan (opsional)..."
                      className="text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border rounded-md p-2"
                      value={record?.note || ''}
                      onChange={(e) => onMark(student.id, currentStatus, e.target.value)}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
        {students.length === 0 && (
           <li className="px-4 py-8 text-center text-gray-500">
             Belum ada data siswa. Tambahkan di menu pengaturan.
           </li>
        )}
      </ul>
    </div>
  );
};

export default AttendanceList;