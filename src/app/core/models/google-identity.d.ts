// Minimal hand-written typings for the Google Identity Services (GIS) script
// (https://accounts.google.com/gsi/client). Only what this app actually uses.
export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: GoogleIdConfiguration): void;
          renderButton(parent: HTMLElement, options?: GoogleButtonOptions): void;
          prompt(momentListener?: (notification: unknown) => void): void;
          disableAutoSelect(): void;
        };
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

export interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

export interface GoogleButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
}
