import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionesMl } from './evaluaciones-ml';

describe('EvaluacionesMl', () => {
  let component: EvaluacionesMl;
  let fixture: ComponentFixture<EvaluacionesMl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionesMl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluacionesMl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
