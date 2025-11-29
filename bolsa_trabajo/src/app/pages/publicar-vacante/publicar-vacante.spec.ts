import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicarVacante } from './publicar-vacante';

describe('PublicarVacante', () => {
  let component: PublicarVacante;
  let fixture: ComponentFixture<PublicarVacante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarVacante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicarVacante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
