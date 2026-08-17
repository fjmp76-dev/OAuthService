export const ADMIN_EMAILS = 'fjmp76@gmail.com,fjmp76@hotmail.com';

export interface AppUser {
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  pictureUrl?: string;
  accessToken?: string;
}
