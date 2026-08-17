import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsersService } from '../../core/services/users.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-users-page',
  imports: [DatePipe, MatButtonModule, MatChipsModule, MatIconModule, MatTableModule, MatTooltipModule],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css'
})
export class UsersPage {
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);
  authService = inject(AuthService);

  readonly displayedColumns = ['email', 'name', 'role', 'createdAt', 'actions'];
  readonly users = this.usersService.users;

  deleteUser(email: string, name: string): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { title: 'Delete user', message: `Delete ${name} (${email})? This action cannot be undone.` }
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.usersService.delete(email);
      }
    });
  }
}
