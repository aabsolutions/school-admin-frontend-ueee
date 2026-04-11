export class Course {
  id: string | number;
  courseCode: string;
  courseName: string;
  description: string;
  department: string;
  departmentId: string;
  credits: number;
  durationWeeks: number;
  isElective: boolean;
  status: string;

  constructor(course: Partial<Course>) {
    this.id = course.id || this.getRandomID();
    this.courseCode = course.courseCode || '';
    this.courseName = course.courseName || '';
    this.description = course.description || '';
    this.department = course.department || '';
    this.departmentId = course.departmentId || '';
    this.credits = course.credits || 3;
    this.durationWeeks = course.durationWeeks || 16;
    this.isElective = course.isElective ?? false;
    this.status = course.status || 'active';
  }

  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
