import { Notification } from '@prisma/client';

export interface NotificationResponse {
  data: Notification[];
  totalRecords: number;
}
