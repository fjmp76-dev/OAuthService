import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { AuthMode, AuthService } from '../../core/services/auth.service';
import { GoogleIdentityService } from '../../core/services/google-identity.service';
import { MicrosoftIdentityService } from '../../core/services/microsoft-identity.service';

@Component({
  selector: 'app-login-page',
  imports: [MatButtonModule, MatButtonToggleModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly microsoftIdentity = inject(MicrosoftIdentityService);
  private readonly router = inject(Router);

  private readonly googleButtonContainer = viewChild.required<ElementRef<HTMLDivElement>>('googleButton');

  readonly mode = signal<AuthMode>('signin');
  readonly errorMessage = signal<string | null>(null);
  readonly loadingGoogle = signal(true);
  readonly loadingMicrosoft = signal(false);
  readonly microsoftReady = signal(false);

  async ngAfterViewInit(): Promise<void> {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/plexrag');
      return;
    }

    try {
      await this.googleIdentity.loadScript();
      this.googleIdentity.initialize(environment.googleClientId, (response) => {
        // Silent One Tap auto-select can only ever mean "sign in" — there is no such thing as an automatic sign-up.
        const effectiveMode: AuthMode = response.select_by === 'auto' ? 'signin' : this.mode();
        const result = this.authService.handleGoogleCredential(response, effectiveMode);
        if (result.ok) {
          this.errorMessage.set(null);
          void this.router.navigateByUrl('/plexrag');
        } else {
          this.errorMessage.set(result.message);
        }
      });
      this.googleIdentity.renderButton(this.googleButtonContainer().nativeElement);
      this.googleIdentity.prompt();
    } catch {
      this.errorMessage.set('Could not sign in with Google. Please check your connection and try again.');
    } finally {
      this.loadingGoogle.set(false);
    }

    try {
      await this.microsoftIdentity.loadScript();
      await this.microsoftIdentity.initialize(environment.microsoftClientId);
      this.microsoftReady.set(true);
    } catch {
      // Microsoft sign-in stays disabled; the button is hidden via microsoftReady.
    }
  }

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set(null);
  }

  async signInWithMicrosoft(): Promise<void> {
    this.errorMessage.set(null);
    this.loadingMicrosoft.set(true);
    try {
      const idToken = await this.microsoftIdentity.login();
      const result = this.authService.handleMicrosoftCredential(idToken, this.mode());
      if (result.ok) {
        void this.router.navigateByUrl('/plexrag');
      } else {
        this.errorMessage.set(result.message);
      }
    } catch {
      this.errorMessage.set('Could not sign in with Microsoft. Please try again.');
    } finally {
      this.loadingMicrosoft.set(false);
    }
  }
}
