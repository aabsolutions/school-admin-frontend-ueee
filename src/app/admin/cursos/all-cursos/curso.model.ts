export class Curso {
  id: string | number;
  nivel: string;
  especialidad: string;
  paralelo: string;
  jornada: string;
  subnivel: string;
  status: string;

  constructor(c: Partial<Curso>) {
    this.id = c.id || this.getRandomID();
    this.nivel = c.nivel || '';
    this.especialidad = c.especialidad || '';
    this.paralelo = c.paralelo || '';
    this.jornada = c.jornada || '';
    this.subnivel = c.subnivel || '';
    this.status = c.status || 'active';
  }

  get displayName(): string {
    return `${this.nivel} - ${this.especialidad} - ${this.paralelo} - ${this.jornada}`;
  }

  public getRandomID(): number {
    const S4 = () => ((1 + Math.random()) * 0x10000) | 0;
    return S4() + S4();
  }
}
