import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyRegister } from './company-register';

describe('CompanyRegister', () => {
  let component: CompanyRegister;
  let fixture: ComponentFixture<CompanyRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
