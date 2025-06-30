import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TourDetailsDialogComponent } from './tour-details-dialog/tour-details-dialog.component';
import { TourLogEditComponent } from './tour-log-edit-dialog/tour-log-edit-dialog.component';
import { MatCardModule } from '@angular/material/card';





@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
  CommonModule,
  FormsModule,
  HttpClientModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatDialogModule,
  MatSelectModule,
  TourDetailsDialogComponent, 
  TourLogEditComponent,
  MatCardModule,
]
})
export class AppComponent implements AfterViewInit {
  map: any;
  tourLogs: any[] = [];
  searchTerm: string = '';
  transportType: string = 'driving-car';

  loadLogs() {
    this.tourLogs = [];

    this.http.get<any[]>('http://localhost:8080/api/tours').subscribe({
      next: (tours) => {
        tours.forEach(tour => {
          this.http.get<any[]>(`http://localhost:8080/api/tours/${tour.id}/logs`).subscribe({
            next: (logs) => {
              logs.forEach(log => {
                this.tourLogs.push({
                  ...log,
                  tourName: tour.name
                });
              });
            },
            error: err => console.error(`Fehler beim Laden der Logs für Tour ${tour.id}`, err)
          });
        });
      },
      error: err => console.error('Fehler beim Laden der Touren:', err)
    });
  }
  


  downloadSummaryReport() {
  this.http.get('http://localhost:8080/api/files/report/summary', {
    responseType: 'blob'
  }).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tour-summary-report.md';
      link.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Fehler beim Herunterladen des Tour-Reports:', err);
      alert('❌ Fehler beim Generieren des Tour-Reports.');
    }
  });
}


  // ✅ Hier einfügen
  title = '';

  //constructor(private http: HttpClient) {}
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  openTourDetails(tour: any) {
  const dialogRef = this.dialog.open(TourDetailsDialogComponent, {
    data: tour,
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.updated || result?.deleted) {
      this.loadTours();  // Tourliste neu laden
      this.loadLogs();   // Logs neu laden ✅
    }
  });
}





  tours: any[] = [];

  loadTours() {
    this.http.get<any[]>('http://localhost:8080/api/tours')
      .subscribe({
        next: (data) => this.tours = data,
        error: (err) => console.error('Fehler beim Laden der Touren:', err)
      });
  }
  startLocation: string = '';
endLocation: string = '';

addRoute() {
  if (!this.startLocation.trim() || !this.endLocation.trim()) {
    alert('Bitte Start und Ziel eingeben.');
    return;
  }
  if (this.startLocation.toLowerCase() === this.endLocation.toLowerCase()) {
  alert("Start und Ziel dürfen nicht identisch sein.");
  return;
}


  const body = {
    name: `${this.startLocation} ➝ ${this.endLocation}`,
    description: '',               // Leer falls keine Beschreibung
    startLocation: this.startLocation,
    endLocation: this.endLocation,
    transportType: this.transportType,  // Kannst du auch auswählbar machen
    distance: 0,                   // Wird vom Backend berechnet
    estimatedTime: '',            // Wird vom Backend berechnet
    mapImagePath: '',             // Optional, je nach Datenbankstruktur
    popularity: 0,                // Defaultwert
    childFriendliness: 0          // Defaultwert
  };

  const headers = {
    headers: { 'Content-Type': 'application/json' }
  };

  this.http.post('http://localhost:8080/api/tours', body, headers).subscribe({
    next: () => {
      alert('Tour wurde erstellt.');
      this.loadTours(); // neu laden
    },
    error: (err) => {
      console.error('Fehler beim Erstellen:', err);
      alert('Fehler beim Erstellen der Tour.');
    }
  });
}



  async ngAfterViewInit() {
  if (typeof window !== 'undefined') {
    const L = await import('leaflet');
    this.map = L.map('map').setView([48.2082, 16.3738], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }
  this.loadLogs(); // 👈 Wird das wirklich ausgeführt?
}
    openLogDialog(log: any) {
  const dialogRef = this.dialog.open(TourLogEditComponent, {
    data: log
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.updated || result?.deleted || result?.created) {
      console.log('Log erstellt, aktualisiert oder gelöscht – Logs werden neu geladen');
      this.loadLogs();
    }
  });
}



importTourReports(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const fileData = reader.result;
    this.http.post('http://localhost:8080/api/files/import', fileData, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => alert('✅ Import erfolgreich!'),
      error: (err) => {
        console.error('❌ Fehler beim Import:', err);
        alert('Fehler beim Importieren der TourReports.');
      }
    });
  };

  reader.readAsText(file);
}
}