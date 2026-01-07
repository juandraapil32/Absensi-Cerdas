export enum AttendanceStatus {
  HADIR = 'Hadir',
  SAKIT = 'Sakit',
  IZIN = 'Izin',
  ALPA = 'Alpa',
}

export interface Student {
  id: string;
  name: string;
  nis: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  timestamp: number;
}

export interface DailySummary {
  date: string;
  totalStudents: number;
  present: number;
  sick: number;
  permission: number;
  absent: number;
  notes: string[];
}

export interface AppConfig {
  sheetScriptUrl: string;
  className: string;
}