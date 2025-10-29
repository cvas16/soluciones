
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string; // 'Pendiente', 'En Progreso', 'Hecho'
  projectId: string; // Para saber a qué proyecto pertenece
  assignedUserId?: string; // Quién está asignado
  // Otros campos (prioridad, fecha límite, etc.)
}
