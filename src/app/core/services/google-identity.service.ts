import { Injectable } from '@angular/core';
import { GoogleButtonOptions, GoogleCredentialResponse } from '../models/google-identity';

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private scriptPromise: Promise<void> | null = null;

  loadScript(): Promise<void> {
    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }

  initialize(clientId: string, callback: (response: GoogleCredentialResponse) => void): void {
    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback,
      auto_select: true,
      cancel_on_tap_outside: false
    });
  }

  renderButton(container: HTMLElement, options?: GoogleButtonOptions): void {
    window.google?.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: 320,
      ...options
    });
  }

  prompt(): void {
    window.google?.accounts.id.prompt();
  }

  disableAutoSelect(): void {
    window.google?.accounts.id.disableAutoSelect();
  }
}
