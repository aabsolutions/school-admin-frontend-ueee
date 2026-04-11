export class AppUser {
  id: string | number;
  username: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  permissions: string[];
  isActive: boolean;

  constructor(user: Partial<AppUser> = {}) {
    this.id = user.id ?? '';
    this.username = user.username ?? '';
    this.name = user.name ?? '';
    this.email = user.email ?? '';
    this.avatar = user.avatar ?? 'assets/images/user/user1.jpg';
    this.role = user.role ?? 'STUDENT';
    this.permissions = user.permissions ?? ['canRead'];
    this.isActive = user.isActive ?? true;
  }
}
