export class Enrollment {
  id: string | number;
  studentId: string;
  studentName: string;
  studentDni: string;
  cursoLectivoId: string;
  cursoDisplay: string;    // nivel - especialidad - paralelo - jornada
  academicYear: string;
  enrolledAt: string;
  status: string;
  notes: string;

  constructor(e: Partial<Enrollment>) {
    this.id = e.id || this.getRandomID();
    this.studentId = e.studentId || '';
    this.studentName = e.studentName || '';
    this.studentDni = e.studentDni || '';
    this.cursoLectivoId = e.cursoLectivoId || '';
    this.cursoDisplay = e.cursoDisplay || '';
    this.academicYear = e.academicYear || '';
    this.enrolledAt = e.enrolledAt || new Date().toISOString().split('T')[0];
    this.status = e.status || 'enrolled';
    this.notes = e.notes || '';
  }

  public getRandomID(): number {
    const S4 = () => ((1 + Math.random()) * 0x10000) | 0;
    return S4() + S4();
  }
}
