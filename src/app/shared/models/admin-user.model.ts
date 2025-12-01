export interface AdminUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  locked: boolean;
  projectCount: number;
}
