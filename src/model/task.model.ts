export class TaskResponse {
  id: number;
  userId: number;
  task: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  SELESAI = 'SELESAI',
  BELUM_SELESAI = 'BELUM_SELESAI'
}

export class CreateTaskRequest {
  userId: number;
  task: string;
}

export class UpdateTaskRequest {
  id: number;
  userId: number;
  task: string;
  status: TaskStatus;
  isDeleted: boolean;
}