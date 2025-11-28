import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCreateModal } from './task-create-modal';

describe('TaskCreateModal', () => {
  let component: TaskCreateModal;
  let fixture: ComponentFixture<TaskCreateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCreateModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCreateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
