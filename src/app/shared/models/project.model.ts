import { UserSummary } from "./user.model";
export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId?: number;
  ownerUsername?: string;
  background?: string;
  members?: UserSummary[];
  taskCount?: number;
  membersCount?: number;
}
