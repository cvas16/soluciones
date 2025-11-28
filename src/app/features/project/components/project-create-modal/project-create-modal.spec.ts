import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectCreateModal } from './project-create-modal';
import { ProjectService } from '../../services/project.service';
import { of } from 'rxjs';

describe('ProjectCreateModal', () => {
  let component: ProjectCreateModal;
  let fixture: ComponentFixture<ProjectCreateModal>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', ['createProject']);
    mockProjectService.createProject.and.returnValue(of({ id: '1', name: 'Test' } as any));

    await TestBed.configureTestingModule({
      imports: [ProjectCreateModal],
      providers: [{ provide: ProjectService, useValue: mockProjectService }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectCreateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createProject with selected background', () => {
    component.projectForm.controls['name'].setValue('New project');
    const testBg = "url('https://example.com/image.jpg')";
    component.selectBackground(testBg);
    component.save();

    expect(mockProjectService.createProject).toHaveBeenCalled();
    const args = mockProjectService.createProject.calls.mostRecent().args[0];
    expect(args.background).toBe(testBg);
    expect(args.name).toBe('New project');
  });
});
