import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-tour-log-edit-dialog',
  standalone: true,
  templateUrl: './tour-log-edit-dialog.component.html',
  styleUrls: ['./tour-log-edit-dialog.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
  ]
})
export class TourLogEditComponent {
  log: any;
  logData: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TourLogEditComponent>,
    private http: HttpClient
  ) {
    this.logData = data;
    this.log = { ...data }; // Log-Daten ins lokale Objekt kopieren
  }

  updateLog() {
    const isoTime = this.log.totalTime?.length === 5
      ? this.log.totalTime + ':00'
      : this.log.totalTime;

    const updated = {
      ...this.log,
      totalTime: isoTime
    };

    this.http.put(`http://localhost:8080/api/tours/${this.log.tourId}/logs/${this.log.id}`, updated)
      .subscribe({
        next: () => {
          alert('✅ Log erfolgreich aktualisiert!');
          this.dialogRef.close({ updated: true });
        },
        error: (err) => {
          console.error('Fehler beim Aktualisieren:', err);
          alert('❌ Fehler beim Aktualisieren des Logs.');
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
  deleteLog(): void {
    if (!confirm('Diesen Log wirklich löschen?')) return;

    const tourId = this.logData.tourId;
    const logId = this.logData.id;

    this.http.delete(`http://localhost:8080/api/tours/${tourId}/logs/${logId}`).subscribe({
      next: () => {
        alert('🗑️ Log gelöscht');
        this.dialogRef.close({ deleted: true });
      },
      error: err => {
        console.error('Fehler beim Löschen des Logs:', err);
        alert('❌ Fehler beim Löschen des Logs.');
      }
    });
  }
}
