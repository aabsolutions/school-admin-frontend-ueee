export class AreaEstudio {
  id: string | number;
  nombre: string;
  descripcion: string;
  isActive: boolean;

  constructor(a: Partial<AreaEstudio> = {}) {
    this.id = a.id || this.getRandomID();
    this.nombre = a.nombre || '';
    this.descripcion = a.descripcion || '';
    this.isActive = a.isActive !== undefined ? a.isActive : true;
  }

  private getRandomID(): number {
    const S4 = () => ((1 + Math.random()) * 0x10000) | 0;
    return S4() + S4();
  }
}
