import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteMemberModal } from './invite-member-modal';

describe('InviteMemberModal', () => {
  let component: InviteMemberModal;
  let fixture: ComponentFixture<InviteMemberModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteMemberModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteMemberModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
