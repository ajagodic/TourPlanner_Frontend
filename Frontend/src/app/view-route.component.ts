import { Component } from '@angular/core';
import { TourService, Tour } from './tour.service';

@Component({
  selector: 'app-view-route',
  templateUrl: './view-route.component.html',
  styleUrls: ['./view-route.component.css']
})
export class ViewRouteComponent {
  tours: Tour[] = [];

  constructor(private tourService: TourService) {}

  loadTours(): void {
    this.tourService.getAllTours().subscribe({
      next: (data) => this.tours = data,
      error: (err) => console.error('Fehler beim Laden der Touren:', err)
    });
  }
}
