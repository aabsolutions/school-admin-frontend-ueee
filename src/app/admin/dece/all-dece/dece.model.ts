export interface DeceRegistro {
  _id: string;
  expedienteId: string;
  /** null cuando confidencial=true y aún no se reveló con la contraseña maestra */
  tipo: string | null;
  fecha: string;
  descripcion: string | null;
  evidencias: string[];
  creadoPor: string;
  createdAt: string;
  confidencial?: boolean;
}

export interface DeceStudentInfo {
  _id: string;
  name: string;
  email: string;
  dni: string;
  gender: string;
  mobile: string;
  img?: string;
}

export interface DeceExpediente {
  _id: string;
  /** Populated when fetched via findOne/getOrCreate */
  studentId: DeceStudentInfo | string;
  /** Present when fetched via findAll() aggregation */
  student?: DeceStudentInfo;
  notas?: string;
  status: string;
  totalRegistros?: number;
  ultimoRegistro?: string;
  createdAt: string;
}

export const DECE_TIPO_OPTIONS = [
  'Seguimiento individual',
  'Entrevista familiar',
  'Crisis emocional',
  'Derivación externa',
  'Taller grupal',
  'Acompañamiento académico',
  'Otro',
];

export const DECE_TIPO_CONFIG: Record<string, { color: string; icon: string }> = {
  'Seguimiento individual':   { color: 'badge-solid-blue',   icon: 'person_search'    },
  'Entrevista familiar':      { color: 'badge-solid-green',  icon: 'family_restroom'  },
  'Crisis emocional':         { color: 'badge-solid-red',    icon: 'emergency'        },
  'Derivación externa':       { color: 'badge-solid-purple', icon: 'output'           },
  'Taller grupal':            { color: 'badge-solid-cyan',   icon: 'groups'           },
  'Acompañamiento académico': { color: 'badge-solid-orange', icon: 'school'           },
  'Otro':                     { color: 'badge-solid-brown',  icon: 'info'             },
};
