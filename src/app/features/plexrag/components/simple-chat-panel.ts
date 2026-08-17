import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChatMessage } from '../../../core/models/plexrag.model';
import { PlexRagApiService } from '../../../core/services/plexrag-api.service';

@Component({
  selector: 'app-simple-chat-panel',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule
  ],
  templateUrl: './simple-chat-panel.html',
  styleUrl: './chat-panel.css'
})
export class SimpleChatPanel {
  private readonly api = inject(PlexRagApiService);
  private readonly scrollAnchor = viewChild<ElementRef<HTMLDivElement>>('scrollAnchor');

  readonly history = signal<ChatMessage[]>([]);
  readonly pending = signal(false);
  readonly questionControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  send(): void {
    const question = this.questionControl.value.trim();
    if (!question || this.pending()) {
      return;
    }

    this.history.update((h) => [...h, { role: 'user', text: question, timestamp: new Date().toISOString() }]);
    this.questionControl.setValue('');
    this.pending.set(true);

    this.api.askSimple(question).subscribe({
      next: (response) => {
        this.history.update((h) => [
          ...h,
          { role: 'assistant', text: response.answer, timestamp: new Date().toISOString(), context: response.context }
        ]);
        this.pending.set(false);
        this.scrollToBottom();
      },
      error: (err: Error) => {
        this.history.update((h) => [...h, { role: 'error', text: err.message, timestamp: new Date().toISOString() }]);
        this.pending.set(false);
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    queueMicrotask(() => this.scrollAnchor()?.nativeElement.scrollIntoView({ behavior: 'smooth' }));
  }
}
