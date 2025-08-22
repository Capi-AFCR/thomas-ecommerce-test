import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '../../services/api';
import { InventoryComponent } from './inventory';
import { of, throwError } from 'rxjs';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockInventory = [
    { id: 1, product: { name: 'Product A' }, stock: 100 },
    { id: 2, product: { name: 'Product B' }, stock: 200 },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getInventory']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        InventoryComponent, // Standalone component in imports
      ],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiService.getInventory.and.returnValue(of(mockInventory));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['id', 'product', 'stock', 'actions']);
  });

  it('should load inventory on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(apiService.getInventory).toHaveBeenCalled();
    expect(component.inventory).toEqual(mockInventory);
  }));

  it('should handle error on getInventory', fakeAsync(() => {
    // Mock console.error to suppress logs
    spyOn(console, 'error');
    apiService.getInventory.and.returnValue(throwError(() => ({ status: 400 })));

    component.ngOnInit();
    tick(100); // Allow error to propagate
    fixture.detectChanges();

    expect(apiService.getInventory).toHaveBeenCalled();
    expect(component.inventory).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  }));

  it('should render inventory in the table', fakeAsync(() => {
    component.inventory = mockInventory;
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2);
    expect(tableRows[0].querySelector('td:nth-child(1)').textContent).toContain('1');
    expect(tableRows[0].querySelector('td:nth-child(2)').textContent).toContain('Product A');
    expect(tableRows[0].querySelector('td:nth-child(3)').textContent).toContain('100');
  }));

  it('should render table headers', fakeAsync(() => {
    component.inventory = mockInventory; // Ensure table renders
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(4, 'Expected 4 table headers');
    expect(headers[0]?.textContent).toContain('ID');
    expect(headers[1]?.textContent).toContain('Producto');
    expect(headers[2]?.textContent).toContain('Stock');
    expect(headers[3]?.textContent).toContain('Acciones');
  }));
});
