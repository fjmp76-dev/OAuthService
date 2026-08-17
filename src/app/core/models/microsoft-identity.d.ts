// Minimal hand-written typings for the MSAL Browser UMD script
// (https://alcdn.msauth.net/browser/3.x/js/msal-browser.min.js). Only what this app actually uses.
export {};

declare global {
  interface Window {
    msal?: {
      PublicClientApplication: new (config: MsalConfiguration) => MsalPublicClientApplication;
    };
  }
}

export interface MsalConfiguration {
  auth: {
    clientId: string;
    authority?: string;
    redirectUri?: string;
  };
}

export interface MsalAccount {
  username: string;
  name?: string;
}

export interface MsalAuthenticationResult {
  idToken: string;
  account: MsalAccount | null;
}

export interface MsalPublicClientApplication {
  initialize(): Promise<void>;
  loginPopup(request?: { scopes: string[] }): Promise<MsalAuthenticationResult>;
  logoutPopup(request?: { account: MsalAccount }): Promise<void>;
  getAllAccounts(): MsalAccount[];
}
