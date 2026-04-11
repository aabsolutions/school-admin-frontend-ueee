export class Department {
  id: string | number;
  img: string;
  department_name: string;
  hod: string;
  phone: string;
  email: string;
  student_capacity: string;
  establishedYear: string;
  totalFaculty: string;

  constructor(department: Department) {
    this.id = department.id || this.getRandomID();
    this.img = department.img || 'assets/images/user/user1.jpg';
    this.department_name = department.department_name || '';
    this.hod = department.hod || '';
    this.phone = department.phone || '';
    this.email = department.email || '';
    this.student_capacity = department.student_capacity || '';
    this.establishedYear = department.establishedYear || '';
    this.totalFaculty = department.totalFaculty || '';
  }

  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
