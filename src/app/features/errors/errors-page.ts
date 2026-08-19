import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorLogService } from '../../core/services/error-log.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';

@Component({
  selector: 'app-errors-page',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './errors-page.html',
  styleUrl: './errors-page.css'
})
export class ErrorsPage implements OnInit {
  private readonly errorLogService = inject(ErrorLogService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['source', 'message', 'actions'];
  readonly entries = this.errorLogService.entries;
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      await this.errorLogService.loadAll();
    } catch {
      // The API interceptor already surfaces this failure; just stop the spinner below.
    } finally {
      this.loading.set(false);
    }
  }

  removeEntry(id: number | string): void {
    this.errorLogService.remove(id).catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to delete error entry.';
      this.snackBar.open(message, 'Dismiss', { duration: 5000 });
    });
  }

  clearLog(): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { title: 'Clear error log', message: 'Delete all logged errors? This action cannot be undone.' }
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.errorLogService.clear().catch((err) => {
          const message = err instanceof Error ? err.message : 'Failed to clear the error log.';
          this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        });
      }
    });
  }
}
