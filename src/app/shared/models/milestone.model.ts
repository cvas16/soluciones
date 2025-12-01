export interface Milestone {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  projectId: number;
  progress: number;
}
