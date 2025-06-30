import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TourLogEditComponent } from './tour-log-edit-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('TourLogEditComponent', () => {
  let component: TourLogEditComponent;
  let fixture: ComponentFixture<TourLogEditComponent>;
  let httpMock: HttpTestingController;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TourLogEditComponent>>;

  beforeEach(async () => {
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const data = { id:1, tourId:2, totalTime:'01:00' };
    await TestBed.configureTestingModule({
      imports: [TourLogEditComponent, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(TourLogEditComponent);
    component = fixture.componentInstance;
    httpMock   = TestBed.inject(HttpTestingController);
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<any>;
  });

  afterEach(() => httpMock.verify());

  it('– Komponente erstellt & Daten kopiert', () => {
    expect(component).toBeTruthy();
    expect(component.log).toEqual({ id:1, tourId:2, totalTime:'01:00' });
  });

  it('– updateLog(): PUT mit ISO-Time & close(updated)', () => {
    component.log.totalTime = '02:00';
    component.updateLog();
    const req = httpMock.expectOne('http://localhost:8080/api/tours/2/logs/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.totalTime).toBe('02:00:00');
    req.flush({});
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ updated: true });
  });

  it('– updateLog(): Fehler → alert & console.error', () => {
    spyOn(console, 'error');
    spyOn(window, 'alert');
    component.updateLog();
    const req = httpMock.expectOne('http://localhost:8080/api/tours/2/logs/1');
    req.error(new ErrorEvent('Err'));
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('❌ Fehler beim Aktualisieren des Logs.');
  });

  it('– deleteLog(): confirm false → kein HTTP', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteLog();
    httpMock.expectNone('http://localhost:8080/api/tours/2/logs/1');
  });

  it('– deleteLog(): confirm true → DELETE & close(deleted)', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteLog();
    const req = httpMock.expectOne('http://localhost:8080/api/tours/2/logs/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ deleted: true });
  });

  it('– deleteLog(): Fehler → alert & console.error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(console, 'error');
    spyOn(window, 'alert');
    component.deleteLog();
    const req = httpMock.expectOne('http://localhost:8080/api/tours/2/logs/1');
    req.error(new ErrorEvent('DelErr'));
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('❌ Fehler beim Löschen des Logs.');
  });
});
