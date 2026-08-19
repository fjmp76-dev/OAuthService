export const ADMIN_EMAILS = 'fjmp76@gmail.com,fjmp76@hotmail.com';

export interface AppUser {
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  pictureUrl?: string;
  accessToken?: string;
}

/** Mirrors PlexRag.Application.Dtos, consumed via the /api/users endpoints. */
export interface UserResponse {
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  createdAt: string;
}
