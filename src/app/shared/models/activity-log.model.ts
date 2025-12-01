export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  userName: string;
  taskId?: number;
}
