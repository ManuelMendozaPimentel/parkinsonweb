import { TestBed } from '@angular/core/testing';

import { EvaluacionesMl } from './evaluaciones-ml';

describe('EvaluacionesMl', () => {
  let service: EvaluacionesMl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluacionesMl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
