import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TourDetailsDialogComponent } from './tour-details-dialog/tour-details-dialog.component';




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
]

})
export class AppComponent implements AfterViewInit {
  map: any;
  searchTerm: string = '';
  transportType: string = 'driving-car';


  // ✅ Hier einfügen
  title = '';

  //constructor(private http: HttpClient) {}
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  openTourDetails(tour: any) {
  const dialogRef = this.dialog.open(TourDetailsDialogComponent, {
    data: tour,
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.deleted) {
      this.loadTours(); // Liste neu laden
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
    }

  async search() {
    if (!this.searchTerm.trim()) return;
    const encoded = encodeURIComponent(this.searchTerm);
    const result: any = await this.http
      .get(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`)
      .toPromise();

    if (result.length) {
      const { lat, lon } = result[0];
      this.map.setView([+lat, +lon], 14);
      const L = await import('leaflet');
      L.marker([+lat, +lon]).addTo(this.map);
    }
  }
  async viewroutes(){
    alert("View")
  }
}