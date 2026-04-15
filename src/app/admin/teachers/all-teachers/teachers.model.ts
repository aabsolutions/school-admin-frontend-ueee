export class Teachers {
  id: string | number;
  img: string;
  imgCuerpoEntero: string;
  peso: number;
  talla: number;
  name: string;
  email: string;
  dni: string;
  gender: string;
  mobile: string;
  department: string;
  departmentId: string;
  areaEstudio: string;
  areaEstudioId: string;
  address: string;
  laboralDependency: string;
  salarialCategory: string;
  emergencyName: string;
  emergencyMobile: string;
  subject_specialization: string;
  experience_years: number;
  status: string;
  birthdate: string;
  bio: string;

  constructor(teachers: Partial<Teachers>) {
    this.id = teachers.id || this.getRandomID();
    this.img = teachers.img || 'assets/images/user/user1.jpg';
    this.imgCuerpoEntero = teachers.imgCuerpoEntero || '';
    this.peso = teachers.peso || 0;
    this.talla = teachers.talla || 0;
    this.name = teachers.name || '';
    this.email = teachers.email || '';
    this.dni = teachers.dni || '';
    this.gender = teachers.gender || '';
    this.mobile = teachers.mobile || '';
    this.department = teachers.department || '';
    this.departmentId = teachers.departmentId || '';
    this.areaEstudio = teachers.areaEstudio || '';
    this.areaEstudioId = teachers.areaEstudioId || '';
    this.address = teachers.address || '';
    this.laboralDependency = teachers.laboralDependency || '';
    this.salarialCategory = teachers.salarialCategory || '';
    this.emergencyName = teachers.emergencyName || '';
    this.emergencyMobile = teachers.emergencyMobile || '';
    this.subject_specialization = teachers.subject_specialization || '';
    this.experience_years = teachers.experience_years || 0;
    this.status = teachers.status || 'active';
    this.birthdate = teachers.birthdate || '';
    this.bio = teachers.bio || '';
  }

  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
