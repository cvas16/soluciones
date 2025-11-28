import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard-page';
import { ProjectService } from '../../services/project.service';
import { of } from 'rxjs';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', ['getProjects']);
    mockProjectService.getProjects.and.returnValue(of([{ id: '1', name: 'Test', background: "url('https://example.com/bg.jpg')" }] as any));

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [{ provide: ProjectService, useValue: mockProjectService }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render project cards with background style', () => {
    const card: HTMLElement | null = fixture.nativeElement.querySelector('.project-card');
    expect(card).toBeTruthy();
    const computedBackground = card?.getAttribute('style') || '';
    expect(computedBackground).toContain("background");
    expect(computedBackground).toContain("example.com/bg.jpg");
  });
});
