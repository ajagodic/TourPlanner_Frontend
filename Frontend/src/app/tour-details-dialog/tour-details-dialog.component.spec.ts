import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TourDetailsDialogComponent } from './tour-details-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('TourDetailsDialogComponent', () => {
  let component: TourDetailsDialogComponent;
  let fixture: ComponentFixture<TourDetailsDialogComponent>;
  let httpMock: HttpTestingController;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TourDetailsDialogComponent>>;
  const initialData = { id: 1, name: 'TTest' };

  beforeEach(async () => {
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [ TourDetailsDialogComponent, HttpClientTestingModule ],
      providers: [
        { provide: MatDialogRef,   useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: initialData }
      ]
    }).compileComponents();

    fixture      = TestBed.createComponent(TourDetailsDialogComponent);
    component    = fixture.componentInstance;
    httpMock     = TestBed.inject(HttpTestingController);
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<any>;
  });

  afterEach(() => httpMock.verify());
  it('– exportAsCSV(): ohne ID → alert', () => {
    spyOn(window, 'alert');
    component.data = {} as any;             // ID entfernen
    component.exportAsCSV();
    expect(window.alert).toHaveBeenCalledWith('❌ Keine Tour-ID vorhanden.');
    // kein HTTP-Call gewünscht
    httpMock.expectNone('http://localhost:8080/api/files/report/tour/1');
  });

  /**
   * -------------------------------------------------------------
   * 2) createLog(): ohne ID → alert
   * -------------------------------------------------------------
   */
  it('– createLog(): ohne ID → alert', () => {
    spyOn(window, 'alert');
    spyOn(component, 'loadLogs');           // stubpt alle loadLogs-Aufrufe
    component.data = {} as any;             // ID entfernen
    component.createLog();
    expect(window.alert).toHaveBeenCalledWith('Keine gültige Tour-ID übergeben.');
    // kein HTTP-Call gewünscht
    httpMock.expectNone('http://localhost:8080/api/tours/1/logs');
  });

  /**
   * -------------------------------------------------------------
   * 3) createLog(): POST & close(created)
   * -------------------------------------------------------------
   */
  /*it('– createLog(): POST & close(created)', fakeAsync(() => {
    // stubpe loadLogs, damit keine GETs entstehen
    spyOn(component, 'loadLogs');
    spyOn(window, 'alert');
    // setze ein gültiges newLog
    component.newLog = {
      logTime:       '2025-01-01T00:00',
      comment:       'c',
      difficulty:    'mittel',
      totalDistance: 2,
      totalTime:     '00:10',
      rating:        5
    };

    component.createLog();

    // wir fangen jetzt EINEN POST auf /logs
    const postReq = httpMock.expectOne(req =>
      req.method === 'POST' &&
      req.url    === 'http://localhost:8080/api/tours/1/logs'
    );
    expect(postReq.request.method).toBe('POST');
    postReq.flush({});    // simuliert Erfolg

    // setTimeout innerhalb subscribe firet nach 300ms
    tick(300);

    // Alert & Dialog-Close prüfen
    expect(window.alert).toHaveBeenCalledWith('✅ Tour-Log gespeichert!');
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ created: true });
  }));*/
});
