export interface User {
  id?: number;
  username: string;
  password: string;
  role: string;
  secret?: string;
}

export enum UserRoles {
  admin = 'admin',
}
