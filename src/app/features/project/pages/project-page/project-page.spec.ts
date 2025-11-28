import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectPage } from './project-page';
import { ProjectService } from '../../services/project.service';
import { of } from 'rxjs';

describe('ProjectPage', () => {
  let component: ProjectPage;
  let fixture: ComponentFixture<ProjectPage>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', ['getProjectWithTasks']);
    mockProjectService.getProjectWithTasks.and.returnValue(of({ project: { id: '1', name: 'Test', background: "url('https://example.com/bg.jpg')" }, tasks: [] } as any));

    await TestBed.configureTestingModule({
      imports: [ProjectPage],
      providers: [{ provide: ProjectService, useValue: mockProjectService }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and apply background to body', () => {
    expect(component).toBeTruthy();
    expect(document.body.style.background).toContain('example.com/bg.jpg');
  });
});
