import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLogModal } from './activity-log-modal';

describe('ActivityLogModal', () => {
  let component: ActivityLogModal;
  let fixture: ComponentFixture<ActivityLogModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityLogModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityLogModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
