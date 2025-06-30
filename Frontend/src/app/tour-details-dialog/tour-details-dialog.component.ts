import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';



@Component({
  selector: 'app-tour-details-dialog',
  standalone: true,
  templateUrl: './tour-details-dialog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule
  ]
})
export class TourDetailsDialogComponent {
  constructor(
  @Inject(MAT_DIALOG_DATA) public data: any,
  private http: HttpClient,
  private dialogRef: MatDialogRef<TourDetailsDialogComponent>
) {}
tour: any;

exportAsCSV() {
  if (!this.data?.id) {
    alert("❌ Keine Tour-ID vorhanden.");
    return;
  }

  this.http.get(`http://localhost:8080/api/files/report/tour/${this.data.id}`, {
    responseType: 'blob'
  }).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tour-${this.data.id}-report.md`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
    error: err => {
      console.error("Fehler beim Exportieren:", err);
      alert("❌ Fehler beim Generieren des Tour-Reports.");
    }
  });
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
tourLogs: any[] = [];

ngOnInit() {
  this.loadLogs();
  this.editedTour = { ...this.data };
  this.tour = this.data; // Kopie der Tour zum Bearbeiten
}

editMode = false;
editedTour: any = {};

enableEdit() {
  this.editMode = true;
  this.editedTour = { ...this.data };
}

saveChanges() {
  this.http.put(`http://localhost:8080/api/tours/${this.data.id}`, this.editedTour).subscribe({
    next: () => {
      alert('✅ Tour aktualisiert.');
      this.editMode = false;
      Object.assign(this.data, this.editedTour); // Änderungen in original übernehmen
    },
    error: () => {
      alert('❌ Fehler beim Speichern der Änderungen.');
    }
  });
}


loadLogs() {
  this.http.get<any[]>(`http://localhost:8080/api/tours/${this.data.id}/logs`)
    .subscribe({
      next: (logs) => this.tourLogs = logs,
      error: (err) => console.error('Fehler beim Laden der Logs:', err)
    });
}

newLog = {
  logTime: new Date().toISOString().slice(0, 16),  // Format für datetime-local (ohne Sekunden!)
  comment: '',
  difficulty: 'mittel',
  totalDistance: 0,
  totalTime: '00:00',
  rating: 3
};


difficultyMap: { [key: string]: number } = {
  leicht: 1,
  mittel: 2,
  schwer: 3
};

createLog() {
  if (!this.data?.id) {
    alert("Keine gültige Tour-ID übergeben.");
    return;
  }

  if (!this.newLog.logTime) {
    alert("❗ Bitte ein gültiges Datum/Zeit eingeben.");
    return;
  }

  // 🛠 ISO-Format mit Sekunden ergänzen (weil datetime-local keine Sekunden hat)
  const isoLogTime = this.newLog.logTime.length === 16
    ? this.newLog.logTime + ':00'
    : this.newLog.logTime;

  const isoTotalTime = this.newLog.totalTime.length === 5
    ? this.newLog.totalTime + ':00'
    : this.newLog.totalTime;

  const difficultyMap: { [key: string]: number } = {
    leicht: 1,
    mittel: 2,
    schwer: 3
  };

  const payload = {
    ...this.newLog,
    logTime: isoLogTime,
    totalTime: isoTotalTime,
    difficulty: difficultyMap[this.newLog.difficulty]
  };

  this.http.post(`http://localhost:8080/api/tours/${this.data.id}/logs`, payload).subscribe({
    next: () => {
      alert("✅ Tour-Log gespeichert!");
      // Formular zurücksetzen:
      this.newLog = {
        logTime: new Date().toISOString().slice(0, 16),
        comment: '',
        difficulty: 'mittel',
        totalDistance: 0,
        totalTime: '00:00',
        rating: 3
      };
      this.loadLogs?.();
    },
    error: err => {
      console.error("Fehler beim Speichern:", err);
      alert("❌ Fehler beim Speichern des Logs.");
    }
  });
}
}