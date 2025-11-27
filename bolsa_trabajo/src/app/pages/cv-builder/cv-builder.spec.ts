import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CvBuilderComponent } from './cv-builder';

describe('CvBuilderComponent', () => {
  let component: CvBuilderComponent;
  let fixture: ComponentFixture<CvBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Importa el componente Standalone que se va a probar
      imports: [CvBuilderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Prueba básica: Verifica que el componente se inicialice correctamente
    expect(component).toBeTruthy();
  });

  it('should initialize at step 1', () => {
    // Prueba: Verifica que el constructor inicie en el primer paso
    expect(component.currentStep()).toBe(1);
  });

  it('should advance to the next step', () => {
    // Prueba: Simula el avance y verifica el estado
    component.nextStep();
    fixture.detectChanges();
    expect(component.currentStep()).toBe(2);
  });

  it('should add an experience entry', () => {
    // Prueba: Simula la adición de un elemento en un array
    const initialCount = component.perfil.experiencias.length;
    component.addEntry('experiencias');
    expect(component.perfil.experiencias.length).toBe(initialCount + 1);
  });
});
