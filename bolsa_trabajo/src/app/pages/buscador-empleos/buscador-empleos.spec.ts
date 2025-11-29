import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorEmpleosComponent } from './buscador-empleos';

describe('BuscadorEmpleosComponent', () => {
  let component: BuscadorEmpleosComponent;
  let fixture: ComponentFixture<BuscadorEmpleosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorEmpleosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscadorEmpleosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
