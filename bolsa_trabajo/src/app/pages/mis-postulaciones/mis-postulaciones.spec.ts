import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPostulaciones } from './mis-postulaciones';

describe('MisPostulaciones', () => {
  let component: MisPostulaciones;
  let fixture: ComponentFixture<MisPostulaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPostulaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisPostulaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
