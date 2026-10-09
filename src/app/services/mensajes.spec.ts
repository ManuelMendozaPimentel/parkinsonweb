import { TestBed } from '@angular/core/testing';

import { Mensajes } from './mensajes';

describe('Mensajes', () => {
  let service: Mensajes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mensajes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
