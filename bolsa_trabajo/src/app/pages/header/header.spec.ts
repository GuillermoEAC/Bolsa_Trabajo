import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a link to /cv-builder', () => {
    // Buscamos el elemento <a> por su clase CSS
    const linkDebugElement = fixture.debugElement.query(By.css('.crear-cv'));
    const linkElement = linkDebugElement.nativeElement as HTMLAnchorElement;

    expect(linkElement.getAttribute('href')).toBe('/cv-builder');
  });

  it('should emit openLogin event on onLoginClick', () => {
    spyOn(component.openLogin, 'emit');

    // Simulamos el evento click pasando un objeto dummy con preventDefault
    const mockEvent = { preventDefault: () => {} } as unknown as Event;
    component.onLoginClick(mockEvent);

    expect(component.openLogin.emit).toHaveBeenCalled();
  });
});
