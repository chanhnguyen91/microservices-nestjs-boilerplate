export interface UserPayload {
  userId: number;
  username: string;
  roleId: number;
  permissions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface QueueMessage<T> {
  event: string;
  message: T;
}

export type ServiceName = 'auth' | 'product' | 'gateway';
