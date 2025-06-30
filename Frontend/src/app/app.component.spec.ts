import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { TourDetailsDialogComponent } from './tour-details-dialog/tour-details-dialog.component';
import { TourLogEditComponent }    from './tour-log-edit-dialog/tour-log-edit-dialog.component';

describe('AppComponent', () => {
  let fixture:   ComponentFixture<AppComponent>;
  let component: AppComponent;
  let httpMock:  HttpTestingController;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    // 1) Spy für MatDialog anlegen
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    // default: afterClosed liefert leer
    dialogSpy.open.and.returnValue({ afterClosed: () => of({}) } as any);

    await TestBed.configureTestingModule({
      // Standalone-Component + HttpClientTestingModule
      imports: [ AppComponent, HttpClientTestingModule ],
      providers: [
        // override MatDialog im Injector
        { provide: MatDialog, useValue: dialogSpy }
      ]
    })
    .compileComponents();

    fixture   = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock  = TestBed.inject(HttpTestingController);

    // 2) Explizit private Properties austauschen
    (component as any).http   = TestBed.inject(HttpClient);
    (component as any).dialog = dialogSpy;
  });

  afterEach(() => httpMock.verify());

  it('sollte die Komponente erstellen', () => {
    expect(component).toBeTruthy();
  });

  it('loadTours(): GET /api/tours und setzt `tours` bei Erfolg', () => {
    const dummy = [
      { id: 1, name: 'T1', startLocation: 'A', endLocation: 'B', transportType:'driving-car', distance:5, estimatedTime:'00:30' }
    ];

    component.loadTours();
    const req = httpMock.expectOne(r =>
      r.method === 'GET' && r.url === 'http://localhost:8080/api/tours'
    );
    req.flush(dummy);

    expect(component.tours).toEqual(dummy);
  });

  it('loadTours(): Fehler wird geloggt', () => {
    spyOn(console, 'error');
    component.loadTours();

    const req = httpMock.expectOne('http://localhost:8080/api/tours');
    req.error(new ErrorEvent('Network'));

    expect(console.error).toHaveBeenCalledWith('Fehler beim Laden der Touren:', jasmine.anything());
  });

  it('loadLogs(): verschachtelte Calls befüllen `tourLogs`', fakeAsync(() => {
    const tours = [{ id: 1, name: 'TourX' }];
    const logs  = [{ id: 42, tourId:1, comment:'c', totalDistance:3, totalTime:'00:15', rating:4 }];

    component.loadLogs();
    const r1 = httpMock.expectOne('http://localhost:8080/api/tours');
    expect(r1.request.method).toBe('GET');
    r1.flush(tours);

    const r2 = httpMock.expectOne('http://localhost:8080/api/tours/1/logs');
    expect(r2.request.method).toBe('GET');
    r2.flush(logs);

    tick();
    expect(component.tourLogs).toEqual([{ ...logs[0], tourName: 'TourX' }]);
  }));

  it('addRoute(): leere Eingaben → alert', () => {
    component.startLocation = '';
    component.endLocation   = '';
    spyOn(window, 'alert');

    component.addRoute();
    expect(window.alert).toHaveBeenCalledWith('Bitte Start und Ziel eingeben.');
  });

  it('addRoute(): Start===Ziel → alert', () => {
    component.startLocation = 'A';
    component.endLocation   = 'a';
    spyOn(window, 'alert');

    component.addRoute();
    expect(window.alert).toHaveBeenCalledWith('Start und Ziel dürfen nicht identisch sein.');
  });

  it('addRoute(): gültig → POST + loadTours()', () => {
    component.startLocation = 'X';
    component.endLocation   = 'Y';
    component.transportType = 'foot-walking';
    spyOn(component, 'loadTours');

    component.addRoute();
    const req = httpMock.expectOne(r =>
      r.method === 'POST' && r.url === 'http://localhost:8080/api/tours'
    );
    expect(req.request.body.name).toBe('X ➝ Y');
    req.flush({});

    expect(component.loadTours).toHaveBeenCalled();
  });

  it('addRoute(): Server-Error → alert & console.error', () => {
    component.startLocation = 'X';
    component.endLocation   = 'Y';
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.addRoute();
    const req = httpMock.expectOne('http://localhost:8080/api/tours');
    req.error(new ErrorEvent('Err'));

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Fehler beim Erstellen der Tour.');
  });

  it('downloadSummaryReport(): erfolgreicher Download löst Klick aus', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:1');
    const clickSpy = jasmine.createSpy('click');
    spyOn(document, 'createElement').and.callFake((tag: string) => {
      if (tag === 'a') return { href:'', download:'', click: clickSpy } as any;
      return document.createElement(tag);
    });

    component.downloadSummaryReport();
    const req = httpMock.expectOne(r =>
      r.method === 'GET' && r.url === 'http://localhost:8080/api/files/report/summary'
    );
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['ok'], { type:'text/markdown' }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('downloadSummaryReport(): Fehler → alert', () => {
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.downloadSummaryReport();
    const req = httpMock.expectOne('http://localhost:8080/api/files/report/summary');
    req.error(new ErrorEvent('Fail'));

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('❌ Fehler beim Generieren des Tour-Reports.');
  });

  it('openTourDetails(): öffnet Dialog & lädt neu', fakeAsync(() => {
    const tour = { id: 7 };
    const after$ = of({ updated: true });
    dialogSpy.open.and.returnValue({ afterClosed: () => after$ } as any);

    spyOn(component, 'loadTours');
    spyOn(component, 'loadLogs');

    component.openTourDetails(tour);
    expect(dialogSpy.open).toHaveBeenCalledWith(TourDetailsDialogComponent, { data: tour });

    tick();
    expect(component.loadTours).toHaveBeenCalled();
    expect(component.loadLogs).toHaveBeenCalled();
  }));

  it('openLogDialog(): öffnet Dialog & lädt Logs neu', fakeAsync(() => {
    const log = { id: 9 };
    const after$ = of({ created: true });
    dialogSpy.open.and.returnValue({ afterClosed: () => after$ } as any);

    spyOn(component, 'loadLogs');
    component.openLogDialog(log);
    expect(dialogSpy.open).toHaveBeenCalledWith(TourLogEditComponent, { data: log });

    tick();
    expect(component.loadLogs).toHaveBeenCalled();
  }));

  it('importTourReports(): keine Dateien → kein HTTP', () => {
    component.importTourReports({ target: { files: [] } } as any);
    httpMock.expectNone('http://localhost:8080/api/files/import');
  });

  it('importTourReports(): Fehler → alert & console.error', () => {
    spyOn(FileReader.prototype, 'readAsText').and.callFake(function(this: FileReader) {
      this.onload!({ target:{ result:'bad' } } as ProgressEvent<FileReader>);
    });
    spyOn(console, 'error');
    spyOn(window, 'alert');

    const bad = new Blob(['bad'], { type:'application/json' });
    component.importTourReports({ target:{ files:[bad] } } as any);

    const req = httpMock.expectOne('http://localhost:8080/api/files/import');
    req.error(new ErrorEvent('ImportErr'));

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Fehler beim Importieren der TourReports.');
  });
});
