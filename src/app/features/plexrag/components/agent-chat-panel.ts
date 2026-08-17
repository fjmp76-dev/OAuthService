import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgentEngine, ChatMessage } from '../../../core/models/plexrag.model';
import { PlexRagApiService } from '../../../core/services/plexrag-api.service';

@Component({
  selector: 'app-agent-chat-panel',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule
  ],
  templateUrl: './agent-chat-panel.html',
  styleUrl: './chat-panel.css'
})
export class AgentChatPanel {
  private readonly api = inject(PlexRagApiService);
  private readonly scrollAnchor = viewChild<ElementRef<HTMLDivElement>>('scrollAnchor');

  readonly engine = signal<AgentEngine>('agent');
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

    const request$ = this.api.askAgent(question);

    request$.subscribe({
      next: (response) => {
        this.history.update((h) => [
          ...h,
          {
            role: 'assistant',
            text: response.answer,
            timestamp: new Date().toISOString(),
            toolCalls: response.toolCalls
          }
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
