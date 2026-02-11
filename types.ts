
export enum QueueStatus {
  WAITING = 'WAITING',
  CALLING = 'CALLING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface QueueItem {
  id: string;
  number: number;
  name: string;
  phone: string;
  timestamp: number;
  status: QueueStatus;
}

export type ViewType = 'REGISTRATION' | 'DISPLAY' | 'ADMIN';

export interface DbConfig {
  url: string;
  key: string;
  roomId: string;
}

export interface AppState {
  queue: QueueItem[];
  currentNumber: number | null;
  lastNumber: number;
  dbConfig: DbConfig | null;
}
