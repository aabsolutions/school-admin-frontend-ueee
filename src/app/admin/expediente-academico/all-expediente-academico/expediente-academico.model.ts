export interface StudentInfo {
  _id: string;
  name: string;
  email: string;
  dni: string;
  gender: string;
  mobile: string;
  img?: string;
}

export interface DriveDocumento {
  _id: string;
  expedienteId: string;
  seccion: string;
  nombre: string;
  url: string;
  descripcion?: string;
  creadoPor?: string;
  fecha?: string;
  createdAt: string;
}

export interface ExpedienteAcademico {
  _id: string;
  studentId: StudentInfo | string;
  student?: StudentInfo;
  totalDocumentos?: number;
  ultimaActividad?: string;
  createdAt: string;
}

/** Row shape returned by findAll (student-centric aggregation) */
export interface StudentExpedienteRow {
  _id: string;          // student _id
  name: string;
  email: string;
  dni: string;
  img?: string;
  status?: string;
  expedienteId?: string;  // undefined if no expediente yet
  totalDocumentos: number;
  ultimaActividad?: string;
}

export interface SeccionGroup {
  nombre: string;
  documentos: DriveDocumento[];
}

export function groupBySecciones(documentos: DriveDocumento[]): SeccionGroup[] {
  const map = new Map<string, DriveDocumento[]>();
  for (const doc of documentos) {
    const list = map.get(doc.seccion) ?? [];
    list.push(doc);
    map.set(doc.seccion, list);
  }
  return Array.from(map.entries()).map(([nombre, docs]) => ({ nombre, documentos: docs }));
}
