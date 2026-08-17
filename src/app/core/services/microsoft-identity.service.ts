import { Injectable } from '@angular/core';
import { MsalPublicClientApplication } from '../models/microsoft-identity';

const SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@4.30.0/lib/msal-browser.min.js';

@Injectable({ providedIn: 'root' })
export class MicrosoftIdentityService {
  private scriptPromise: Promise<void> | null = null;
  private app: MsalPublicClientApplication | null = null;

  loadScript(): Promise<void> {
    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      if (window.msal) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Microsoft Identity script.'));
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }

  async initialize(clientId: string): Promise<void> {
    if (this.app || !window.msal) {
      return;
    }
    this.app = new window.msal.PublicClientApplication({
      auth: {
        clientId,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
      }
    });
    await this.app.initialize();
  }

  /** Opens the Microsoft popup and returns the signed id_token (JWT), same shape as Google's credential. */
  async login(): Promise<string> {
    if (!this.app) {
      throw new Error('Microsoft Identity not initialized.');
    }
    const result = await this.app.loginPopup({ scopes: ['openid', 'profile', 'email'] });
    return result.idToken;
  }

  async logout(): Promise<void> {
    const account = this.app?.getAllAccounts()[0];
    if (this.app && account) {
      await this.app.logoutPopup({ account });
    }
  }
}
