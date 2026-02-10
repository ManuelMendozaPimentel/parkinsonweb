import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOverlay } from './modal-overlay';

describe('ModalOverlay', () => {
  let component: ModalOverlay;
  let fixture: ComponentFixture<ModalOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
