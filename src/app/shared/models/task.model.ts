
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  projectId: string;
  assignedUserId?: string;
}
