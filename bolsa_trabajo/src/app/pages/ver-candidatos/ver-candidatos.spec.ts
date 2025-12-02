import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerCandidatosComponent } from './ver-candidatos';

describe('VerCandidatosComponent', () => {
  let component: VerCandidatosComponent;
  let fixture: ComponentFixture<VerCandidatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerCandidatosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerCandidatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
