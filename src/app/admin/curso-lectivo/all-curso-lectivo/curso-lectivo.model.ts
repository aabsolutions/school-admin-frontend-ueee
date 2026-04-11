export class CursoLectivo {
  id: string | number;
  cursoId: string;
  cursoDisplay: string;   // nivel + especialidad + paralelo + jornada (flattened)
  academicYear: string;
  tutorId: string;
  tutorName: string;
  inspectorId: string;
  inspectorName: string;
  psicologoId: string;
  psicologoName: string;
  status: string;

  constructor(cl: Partial<CursoLectivo>) {
    this.id = cl.id || this.getRandomID();
    this.cursoId = cl.cursoId || '';
    this.cursoDisplay = cl.cursoDisplay || '';
    this.academicYear = cl.academicYear || '';
    this.tutorId = cl.tutorId || '';
    this.tutorName = cl.tutorName || '';
    this.inspectorId = cl.inspectorId || '';
    this.inspectorName = cl.inspectorName || '';
    this.psicologoId = cl.psicologoId || '';
    this.psicologoName = cl.psicologoName || '';
    this.status = cl.status || 'active';
  }

  public getRandomID(): number {
    const S4 = () => ((1 + Math.random()) * 0x10000) | 0;
    return S4() + S4();
  }
}
