import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tour-details-dialog',
  templateUrl: './tour-details-dialog.component.html',
  styleUrls: ['./tour-details-dialog.component.css'],
  standalone: true,
  imports: []
})
export class TourDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('Empfangene Daten:', data); // ⬅ Debug-Ausgabe
  }
}
