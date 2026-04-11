export interface ExpedienteRegistro {
  _id: string;
  expedienteId: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  evidencias: string[];
  creadoPor?: string;
  createdAt: string;
}

export interface StudentInfo {
  _id: string;
  name: string;
  email: string;
  dni: string;
  gender: string;
  mobile: string;
  img?: string;
}

export interface Expediente {
  _id: string;
  /** Populated when fetched via findOne/getOrCreate */
  studentId: StudentInfo | string;
  /** Present when fetched via findAll() aggregation */
  student?: StudentInfo;
  notas?: string;
  status: string;
  totalRegistros?: number;
  ultimoRegistro?: string;
  createdAt: string;
}

export const TIPO_OPTIONS = [
  'Reunión',
  'Indisciplina',
  'Permiso',
  'Atraso',
  'Acuerdo',
  'Llamado de atención',
  'Otro',
];

export const TIPO_CONFIG: Record<string, { color: string; icon: string }> = {
  'Reunión':             { color: 'badge-solid-blue',   icon: 'groups'     },
  'Indisciplina':        { color: 'badge-solid-red',    icon: 'warning'    },
  'Permiso':             { color: 'badge-solid-green',  icon: 'assignment' },
  'Atraso':              { color: 'badge-solid-orange', icon: 'schedule'   },
  'Acuerdo':             { color: 'badge-solid-cyan',   icon: 'handshake'  },
  'Llamado de atención': { color: 'badge-solid-purple', icon: 'campaign'   },
  'Otro':                { color: 'badge-solid-brown',  icon: 'info'       },
};
