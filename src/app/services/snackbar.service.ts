import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar:MatSnackBar) { }

  showSuccess(message: string, duration=3000): void {
    const config: MatSnackBarConfig = {
      verticalPosition: 'top',
      duration: duration,
      panelClass: ['statusSuccess'],
    };

    this.snackBar.open(message, 'Dismiss', config);
  }

  showError(message: string, duration=5000): void {
    const config: MatSnackBarConfig = {
      verticalPosition: 'top',
      duration: duration,
      panelClass: ['statusFailed'],
    };

    this.snackBar.open(message, 'Dismiss', config);
  }
}
