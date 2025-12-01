import { SubTask } from "./sub-task.model";
import { Tag } from "./tag.model";
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  projectId: number;
  assignedUserId?: number;
  assignedUsername?: string;
  priority?: string;
  createdAt?: string;
  createdByUsername?: string;
  attachments?: string[];
  subTasks?: SubTask[];
  tags?: Tag[];
  milestoneId?: number;
  milestoneName?: string;
}
