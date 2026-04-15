export class Students {
  id: string | number;
  img: string;
  imgCuerpoEntero: string;
  peso: number;
  talla: number;
  name: string;
  email: string;
  dni: string;
  mobile: string;
  gender: string;
  residenceZone: string;
  birthdate: string;
  address: string;
  parentGuardianName: string;
  parentGuardianMobile: string;
  fatherName: string;
  fatherMobile: string;
  motherName: string;
  motherMobile: string;
  status: string;

  constructor(students: Partial<Students>) {
    this.id = students.id || this.getRandomID();
    this.img = students.img || 'assets/images/user/user1.jpg';
    this.imgCuerpoEntero = students.imgCuerpoEntero || '';
    this.peso = students.peso || 0;
    this.talla = students.talla || 0;
    this.name = students.name || '';
    this.email = students.email || '';
    this.dni = students.dni || '';
    this.mobile = students.mobile || '';
    this.gender = students.gender || '';
    this.residenceZone = students.residenceZone || '';
    this.birthdate = students.birthdate || '';
    this.address = students.address || '';
    this.parentGuardianName = students.parentGuardianName || '';
    this.parentGuardianMobile = students.parentGuardianMobile || '';
    this.fatherName = students.fatherName || '';
    this.fatherMobile = students.fatherMobile || '';
    this.motherName = students.motherName || '';
    this.motherMobile = students.motherMobile || '';
    this.status = students.status || 'active';
  }

  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
