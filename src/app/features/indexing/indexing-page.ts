import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, interval, Subscription, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { INITIAL_INDEX_STATUS, IndexStatus } from '../../core/models/index-status.model';
import { LibrarySection } from '../../core/models/library-section.model';
import { IndexingApiService } from '../../core/services/indexing-api.service';

const POLL_INTERVAL_MS = 1500;

@Component({
  selector: 'app-indexing-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './indexing-page.html',
  styleUrl: './indexing-page.css'
})
export class IndexingPage {
  private readonly api = inject(IndexingApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['id', 'title', 'type'];
  readonly sections = signal<LibrarySection[]>([]);
  readonly status = signal<IndexStatus>(INITIAL_INDEX_STATUS);
  readonly statusPlex = signal<IndexStatus>(INITIAL_INDEX_STATUS);
  readonly loadingSections = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly progressPercent = computed(() => {
    const s = this.status();
    return s.sectionsTotal > 0 ? Math.round((s.sectionsDone / s.sectionsTotal) * 100) : 0;
  });

  readonly progressPercentPlex = computed(() => {
    const s = this.statusPlex();
    return s.sectionsTotal > 0 ? Math.round((s.sectionsDone / s.sectionsTotal) * 100) : 0;
  });

  private pollSubscription: Subscription | null = null;
  private pollSubscriptionPlex: Subscription | null = null;

  constructor() {
    forkJoin({
      sections: this.api.getLibrarySections(),
      status: this.api.getIndexStatus()
    }).subscribe({
      next: ({ sections, status }) => {
        this.sections.set(sections);
        this.status.set(status);
        this.loadingSections.set(false);
        if (status.running) {
          this.startPolling();
        }
      },
      error: (err: Error) => {
        this.loadError.set(err.message);
        this.loadingSections.set(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.pollSubscription?.unsubscribe();
      this.pollSubscriptionPlex?.unsubscribe();
    });
  }

  reindexAll(): void {
    if (this.status().running) {
      return;
    }
    this.api.triggerReindex().subscribe({
      next: (started) => {
        if (started) {
          this.api.getIndexStatus().subscribe((status) => this.status.set(status));
          this.startPolling();
        }
      },
      error: (err: Error) => this.loadError.set(err.message)
    });
  }

  reindexPlex(): void {
    if (this.statusPlex().running) {
      return;
    }
    this.api.triggerPlexReindex().subscribe({
      next: (started) => {
        if (started) {
          this.api.getIndexStatus().subscribe((status) => this.statusPlex.set(status));
          this.startPollingPlex();
        }
      },
      error: (err: Error) => this.loadError.set(err.message)
    });
  }

  private startPolling(): void {
    if (this.pollSubscription) {
      return;
    }
    this.pollSubscription = interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => this.api.getIndexStatus()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((status) => {
        this.status.set(status);
        if (!status.running) {
          this.pollSubscription?.unsubscribe();
          this.pollSubscription = null;
          this.api.getLibrarySections().subscribe((sections) => this.sections.set(sections));
        }
      });
  }

  private startPollingPlex(): void {
    if (this.pollSubscriptionPlex) {
      return;
    }
    this.pollSubscriptionPlex = interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => this.api.getIndexStatus()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((status) => {
        this.statusPlex.set(status);
        if (!status.running) {
          this.pollSubscriptionPlex?.unsubscribe();
          this.pollSubscriptionPlex = null;
          this.api.getLibrarySections().subscribe((sections) => this.sections.set(sections));
        }
      });
  }
}
