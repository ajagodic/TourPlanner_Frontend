import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDetailsDialogComponent } from './tour-details-dialog.component';

describe('TourDetailsDialogComponent', () => {
  let component: TourDetailsDialogComponent;
  let fixture: ComponentFixture<TourDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
