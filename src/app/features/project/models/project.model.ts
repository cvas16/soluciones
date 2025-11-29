
export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  background?: string;
  members?: string[];
  taskCount?: number;
  membersCount?: number;
}
