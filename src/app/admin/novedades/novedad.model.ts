export type NovedadTipo = 'Fuga' | 'Robo' | 'Indisciplina' | 'ProblemaAula';

export interface NovedadStudentInfo {
  _id: string;
  name: string;
  dni: string;
  mobile?: string;
}

export interface NovedadCursoInfo {
  nivel: string;
  subnivel?: string;
  especialidad: string;
  paralelo: string;
  jornada: string;
}

export interface NovedadCursoLectivo {
  _id: string;
  academicYear: string;
  status: string;
  cursoId: NovedadCursoInfo;
}

export interface Novedad {
  _id: string;
  tipo: NovedadTipo;
  /** Populated; empty array when tipo === 'ProblemaAula' */
  studentIds: NovedadStudentInfo[];
  /** Populated; null unless tipo === 'ProblemaAula' */
  cursoLectivoId: NovedadCursoLectivo | null;
  fecha: string;
  descripcion: string;
  evidencias: string[];
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
}

export const NOVEDAD_TIPO_OPTIONS: { value: NovedadTipo; label: string }[] = [
  { value: 'Fuga', label: 'Fuga' },
  { value: 'Robo', label: 'Robo' },
  { value: 'Indisciplina', label: 'Indisciplina' },
  { value: 'ProblemaAula', label: 'Problema de aula' },
];

export const NOVEDAD_TIPO_CONFIG: Record<NovedadTipo, { color: string; icon: string; label: string }> = {
  Fuga:         { color: 'badge-solid-orange', icon: 'directions_run', label: 'Fuga'          },
  Robo:         { color: 'badge-solid-red',    icon: 'report',         label: 'Robo'           },
  Indisciplina: { color: 'badge-solid-purple', icon: 'warning',        label: 'Indisciplina'   },
  ProblemaAula: { color: 'badge-solid-blue',   icon: 'meeting_room',   label: 'Problema de aula' },
};

/** Safe lookup for templates — avoids indexing Record<NovedadTipo,...> with a widened string type */
export function getTipoConfig(tipo: string): { color: string; icon: string; label: string } {
  return NOVEDAD_TIPO_CONFIG[tipo as NovedadTipo] ?? { color: '', icon: 'help_outline', label: tipo };
}

/** True when the tipo requires selecting students (all except ProblemaAula) */
export function novedadRequiresStudents(tipo: NovedadTipo | ''): boolean {
  return !!tipo && tipo !== 'ProblemaAula';
}

/** Builds a display label for a populated curso lectivo, e.g. "Bachillerato - Ciencias - A - Matutina (2024-2025)" */
export function cursoLectivoDisplay(cl: NovedadCursoLectivo | null | undefined): string {
  if (!cl) return '—';
  const c = cl.cursoId;
  const base = c
    ? [c.nivel, c.subnivel, c.especialidad, c.paralelo, c.jornada].filter(Boolean).join(' - ')
    : cl._id;
  return `${base} (${cl.academicYear})`;
}
