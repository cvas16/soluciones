
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  projectId: string;
  assignedUserId?: string;
  assignedUsername?: string;
  priority?: string;
  createdAt?: string;
  createdByUsername?: string;
  attachments?: string[];
}
