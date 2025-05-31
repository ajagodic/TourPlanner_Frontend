import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tour-details-dialog',
  standalone: true,
  templateUrl: './tour-details-dialog.component.html',
  imports: [
    MatDialogModule,
    MatButtonModule,
    HttpClientModule
  ]
})
export class TourDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TourDetailsDialogComponent>,
    private http: HttpClient
  ) {}
exportAsCSV() {
  const fields = ['name', 'startLocation', 'endLocation', 'transportType', 'estimatedTime', 'distance'];
  const csvHeader = fields.join(',') + '\n';
  const csvRow = fields.map(f => `"${(this.data[f] || '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
  const csv = csvHeader + csvRow;

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tour-${this.data.name.replace(/\s+/g, '_')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

  deleteTour() {
    const confirmDelete = confirm(`Möchtest du die Tour "${this.data.name}" wirklich löschen?`);
    if (!confirmDelete) return;

    this.http.delete(`http://localhost:8080/api/tours/${this.data.id}`).subscribe({
      next: () => {
        alert('Tour gelöscht');
        this.dialogRef.close({ deleted: true });
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        alert('Fehler beim Löschen der Tour');
      }
    });
  }
}
