export interface GoogleIdTokenPayload {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export interface MicrosoftIdTokenPayload {
  email?: string;
  preferred_username?: string;
  name?: string;
}

/** Decodes the payload of a JWT without verifying its signature (verification happens on Google's side before issuing it). */
export function decodeJwtPayload<T>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
