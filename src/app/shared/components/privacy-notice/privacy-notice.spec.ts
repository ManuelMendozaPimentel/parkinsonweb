import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyNotice } from './privacy-notice';

describe('PrivacyNotice', () => {
  let component: PrivacyNotice;
  let fixture: ComponentFixture<PrivacyNotice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyNotice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyNotice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
