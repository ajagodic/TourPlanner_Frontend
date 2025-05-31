import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tour {
  id: number;
  name: string;
  // Weitere Felder je nach TourDto
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8080/api/tours'; // Backend-URL anpassen

  constructor(private http: HttpClient) {}

  getAllTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.apiUrl);
  }
}
