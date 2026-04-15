export class Materia {
  id: string | number;
  nombre: string;
  codigo: string;
  descripcion: string;
  horas: number;
  status: string;

  constructor(m: Partial<Materia>) {
    this.id = m.id || this.getRandomID();
    this.nombre = m.nombre || '';
    this.codigo = m.codigo || '';
    this.descripcion = m.descripcion || '';
    this.horas = m.horas ?? 0;
    this.status = m.status || 'active';
  }

  public getRandomID(): number {
    const S4 = () => ((1 + Math.random()) * 0x10000) | 0;
    return S4() + S4();
  }
}
