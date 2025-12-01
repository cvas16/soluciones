import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneListModal } from './milestone-list-modal';

describe('MilestoneListModal', () => {
  let component: MilestoneListModal;
  let fixture: ComponentFixture<MilestoneListModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneListModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MilestoneListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
