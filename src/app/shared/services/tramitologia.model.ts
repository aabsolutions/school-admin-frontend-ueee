export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email';
export type TramiteState = 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado' | 'finalizado';

export interface VariableConfig {
  key: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  order: number;
}

export interface RequiredAttachment {
  name: string;
  description: string;
  required: boolean;
  allowedMimes: string[];
  maxSizeBytes: number;
}

export interface DatosRepresentante {
  nombre: string;
  dni: string;
  contacto: string;
}

export interface HijoActivo {
  student: {
    _id: string;
    name: string;
    email: string;
    dni: string;
    img?: string;
    gender: string;
    status: string;
  };
  cursoNombre: string;
  academicYear: string;
}

export interface Plantilla {
  _id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: 'solicitud' | 'respuesta';
  solicitanteRoles: string[];
  bodyHtml: string;
  variables: VariableConfig[];
  requiredAttachments: RequiredAttachment[];
  isActive: boolean;
  version: number;
  plantillaRespuestaId?: string | Plantilla;
  createdAt: string;
  updatedAt: string;
}

export interface PlantillaSnapshot {
  plantillaId: string;
  nombre: string;
  version: number;
  bodyHtml: string;
  variables: VariableConfig[];
  requiredAttachments: RequiredAttachment[];
  plantillaRespuestaId?: string;
}

export interface FilledValue {
  key: string;
  value: unknown;
}

export interface TramiteAttachment {
  name: string;
  url: string;
  mime: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Tramite {
  _id: string;
  codigo: string;
  plantilla: PlantillaSnapshot;
  solicitanteUserId: string;
  solicitanteRole: string;
  operativoUserId?: string;
  values: FilledValue[];
  attachments: TramiteAttachment[];
  renderedHtml: string;
  state: TramiteState;
  lastObservation?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  datosRepresentante?: DatosRepresentante;
  estudianteId?: string;
  cursoNombre?: string;
  respuestaValues?: FilledValue[];
  respuestaRenderedHtml?: string;
}

export interface TramiteHistory {
  _id: string;
  tramiteId: string;
  fromState: string;
  toState: string;
  actorUserId: { _id: string; name: string; username: string; role: string } | string;
  actorRole: string;
  observation: string;
  createdAt: string;
}

export interface ParsedVariables {
  systemVars: string[];
  customVars: string[];
  allMatches: string[];
}

export interface TramiteStats {
  totals: { total: number; avgResolutionHours: number | null };
  byState: Array<{ state: string; count: number }>;
  byCategoria: Array<{ _id: string; categoria: string; count: number }>;
  byOperativo: Array<{ _id: string; operativoName: string; total: number; avgResolutionHours: number }>;
  timeSeries: Array<{ _id: { year: number; month: number; day: number }; count: number }>;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
