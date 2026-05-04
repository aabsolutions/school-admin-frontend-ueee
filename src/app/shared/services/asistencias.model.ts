export interface UserBasic {
  _id: string;
  name: string;
  username: string;
  role: string;
}

export interface CursoBasic {
  _id: string;
  nivel: string;
  paralelo: string;
  jornada: string;
  especialidad?: string;
}

export interface CursoLectivoBasic {
  _id: string;
  academicYear: string;
  cursoId: CursoBasic;
  status: string;
}

export interface StudentBasic {
  _id: string;
  name: string;
  dni?: string;
}

export interface AttendanceAssignment {
  _id: string;
  userId: UserBasic;
  cursoLectivoId: CursoLectivoBasic;
  cursoId: string;
  isActive: boolean;
  students?: StudentBasic[];
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  _id: string;
  cursoLectivoId: string;
  cursoId: string;
  date: string;
  takenByUserId: string;
  records: AttendanceEntry[];
  createdAt: string;
}

export interface SaveAttendancePayload {
  cursoLectivoId: string;
  date: string;
  records: AttendanceEntry[];
}

export interface StudentAttendanceSummary {
  studentId: string;
  name: string;
  dni?: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface AttendanceConsolidated {
  totalDays: number;
  totalStudents: number;
  totalPresences: number;
  totalAbsences: number;
  attendanceRate: number;
  students: StudentAttendanceSummary[];
}

export interface StudentHistoryEntry {
  date: string;
  cursoLectivoId: string;
  entry: { studentId: string; status: AttendanceStatus; note: string };
}

export interface ChildAttendanceSummary {
  studentId: string;
  name: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  recentRecords: Array<{ date: string; status: AttendanceStatus; note: string }>;
}

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Presente',
  absent: 'Ausente',
  late: 'Tardanza',
  excused: 'Justificado',
};

export const STATUS_COLOR: Record<AttendanceStatus, string> = {
  present: 'primary',
  absent: 'warn',
  late: 'accent',
  excused: '',
};
