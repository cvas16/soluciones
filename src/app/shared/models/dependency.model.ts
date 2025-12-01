export interface Dependency {
  id: number;
  blockedTaskId: number;
  blockerTaskId: number;
  blockerTaskTitle: string;
  blockerTaskStatus: string;
}
