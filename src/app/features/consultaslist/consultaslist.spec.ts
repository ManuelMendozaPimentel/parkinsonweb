import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Consultaslist } from './consultaslist';

describe('Consultaslist', () => {
  let component: Consultaslist;
  let fixture: ComponentFixture<Consultaslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consultaslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Consultaslist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
