export interface StudentMedicalInfo {
  bloodType?: string;
  hasAllergies?: boolean;
  allergiesDetail?: string;
  hasChronicCondition?: boolean;
  chronicConditionDetail?: string;
  currentMedications?: string;
  hasDisability?: boolean;
  disabilityDetail?: string;
  hasConadis?: boolean;
  conadisNumber?: string;
  doctorName?: string;
  doctorPhone?: string;
  healthInsurance?: string;
  policyNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  medicalNotes?: string;
}

export interface StudentFamilyInfo {
  familySituation?: string;
  livesWithWhom?: string;
  fatherOccupation?: string;
  fatherEducationLevel?: string;
  motherOccupation?: string;
  motherEducationLevel?: string;
  numberOfSiblings?: number;
  studentBirthOrder?: number;
  socioeconomicLevel?: string;
  housingType?: string;
  familyNotes?: string;
}

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
  fatherId: any;
  motherId: any;
  guardianId: any;
  status: string;
  nee: boolean;
  aulaEspecial: boolean;
  edad?: number | null;
  medicalInfo: StudentMedicalInfo;
  familyInfo: StudentFamilyInfo;

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
    this.fatherId = students.fatherId ?? null;
    this.motherId = students.motherId ?? null;
    this.guardianId = students.guardianId ?? null;
    this.status = students.status || 'active';
    this.nee = students.nee ?? false;
    this.aulaEspecial = students.aulaEspecial ?? false;
    this.medicalInfo = students.medicalInfo ?? {};
    this.familyInfo = students.familyInfo ?? {};
  }

  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
