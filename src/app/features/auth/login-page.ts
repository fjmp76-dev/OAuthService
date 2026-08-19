import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { GoogleIdentityService } from '../../core/services/google-identity.service';
import { MicrosoftIdentityService } from '../../core/services/microsoft-identity.service';

@Component({
  selector: 'app-login-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly microsoftIdentity = inject(MicrosoftIdentityService);
  private readonly router = inject(Router);

  private readonly googleButtonContainer = viewChild.required<ElementRef<HTMLDivElement>>('googleButton');

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
      this.googleIdentity.initialize(environment.googleClientId, async (response) => {
        const result = await this.authService.handleGoogleCredential(response);
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

  async signInWithMicrosoft(): Promise<void> {
    this.errorMessage.set(null);
    this.loadingMicrosoft.set(true);
    try {
      const idToken = await this.microsoftIdentity.login();
      const result = await this.authService.handleMicrosoftCredential(idToken);
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
