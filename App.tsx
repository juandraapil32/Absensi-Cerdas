import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import AttendanceList from './components/AttendanceList';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import { Student, AttendanceRecord, AppConfig, AttendanceStatus, DailySummary } from './types';
import { sendToGoogleSheets } from './services/sheetService';
import { generateAttendanceReport } from './services/geminiService';
import { Save, Send, Sparkles, Loader2, Calendar } from 'lucide-react';

const STORAGE_KEY_CONFIG = 'absensi_config';
const STORAGE_KEY_STUDENTS = 'absensi_students';
const STORAGE_KEY_ATTENDANCE = 'absensi_attendance';

const App: React.FC = () => {
  // State
  const [config, setConfig] = useState<AppConfig>({
    className: '',
    sheetScriptUrl: ''
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // UI States
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    const savedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
    const savedAttendance = localStorage.getItem(STORAGE_KEY_ATTENDANCE);

    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    
    if (savedAttendance) {
        setAttendance(JSON.parse(savedAttendance));
    } else {
        if (!savedConfig) {
            setIsHelpOpen(true);
        }
    }
  }, []);

  // Save Config & Students
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
  };

  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(newStudents));
  };

  // Mark Attendance
  const handleMarkAttendance = useCallback((studentId: string, status: AttendanceStatus, note?: string) => {
    setAttendance(prev => {
      const newRecord: AttendanceRecord = {
        studentId,
        status,
        note: note !== undefined ? note : prev[studentId]?.note,
        timestamp: Date.now()
      };
      const newAttendance = { ...prev, [studentId]: newRecord };
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(newAttendance));
      return newAttendance;
    });
  }, []);

  // Computed Stats
  const stats = useMemo(() => {
    const counts = {
      [AttendanceStatus.HADIR]: 0,
      [AttendanceStatus.SAKIT]: 0,
      [AttendanceStatus.IZIN]: 0,
      [AttendanceStatus.ALPA]: 0,
    };
    
    (Object.values(attendance) as AttendanceRecord[]).forEach(record => {
       if (record && counts[record.status] !== undefined) {
         counts[record.status]++;
       }
    });

    return counts;
  }, [attendance]);

  const handleSendToSheets = async () => {
    setIsSending(true);
    // Pass the selectedDate to the service
    const result = await sendToGoogleSheets(config.sheetScriptUrl, config.className, students, attendance, selectedDate);
    alert(result.message);
    setIsSending(false);
  };

  const handleGenerateAiReport = async () => {
    if (students.length === 0) return;
    
    setIsGeneratingAi(true);
    setAiReport(null);
    
    // Prepare summary object
    const presentCount = stats[AttendanceStatus.HADIR];
    const sickCount = stats[AttendanceStatus.SAKIT];
    const permissionCount = stats[AttendanceStatus.IZIN];
    const absentCount = students.length - (presentCount + sickCount + permissionCount);

    const notes = (Object.values(attendance) as AttendanceRecord[])
        .filter(r => r.note && r.note.trim().length > 0)
        .map(r => {
            const student = students.find(s => s.id === r.studentId);
            return `${student?.name} (${r.status}): ${r.note}`;
        });

    // Format date for AI context
    const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const summary: DailySummary = {
        date: formattedDate,
        totalStudents: students.length,
        present: presentCount,
        sick: sickCount,
        permission: permissionCount,
        absent: absentCount,
        notes
    };

    const report = await generateAttendanceReport(summary, config.className);
    setAiReport(report);
    setIsGeneratingAi(false);
  };

  const handleResetDay = () => {
      if(window.confirm("Mulai hari baru? Semua data kehadiran akan dihapus (pastikan sudah dikirim ke Sheets).")) {
          setAttendance({});
          setAiReport(null);
          localStorage.removeItem(STORAGE_KEY_ATTENDANCE);
      }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header 
        className={config.className} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Date Selection Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Calendar className="h-5 w-5" />
                </div>
                <div>
                    <label htmlFor="date-picker" className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal Absensi</label>
                    <input 
                        id="date-picker"
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                    />
                </div>
            </div>
            <div className="text-xs text-gray-400 italic">
                * Pastikan tanggal benar sebelum kirim ke Sheets
            </div>
        </div>

        {/* Statistics Dashboard */}
        <StatsCard counts={stats} total={students.length} />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sticky top-20 z-40 bg-gray-100/90 backdrop-blur py-2">
            <button
                onClick={handleSendToSheets}
                disabled={isSending || !config.sheetScriptUrl}
                className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!config.sheetScriptUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {isSending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                Kirim ke Sheets
            </button>
            
            <button
                onClick={handleGenerateAiReport}
                disabled={isGeneratingAi || students.length === 0}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
                 {isGeneratingAi ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Analisis AI
            </button>

             <button
                onClick={handleResetDay}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
                Reset
            </button>
        </div>

        {/* AI Report Section */}
        {aiReport && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg p-6 mb-6">
                <h3 className="flex items-center text-lg font-semibold text-indigo-900 mb-2">
                    <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                    Laporan Cerdas
                </h3>
                <div className="prose prose-sm text-indigo-800 whitespace-pre-line">
                    {aiReport}
                </div>
            </div>
        )}

        {/* Student List */}
        <AttendanceList 
          students={students} 
          attendance={attendance} 
          onMark={handleMarkAttendance} 
        />
        
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        students={students}
        onUpdateStudents={handleUpdateStudents}
      />
      
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;