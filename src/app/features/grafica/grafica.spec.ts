import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grafica } from './grafica';

describe('Grafica', () => {
  let component: Grafica;
  let fixture: ComponentFixture<Grafica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grafica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grafica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
