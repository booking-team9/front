import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestProfileComponent } from './guest-profile.component';

describe('GuestProfileComponent', () => {
  let component: GuestProfileComponent;
  let fixture: ComponentFixture<GuestProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuestProfileComponent]
    });
    fixture = TestBed.createComponent(GuestProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
