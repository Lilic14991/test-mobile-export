/**
 * Services Index
 * 
 * This file exports all services from the services directory,
 * making it easier to import them in other parts of the app.
 */

import notificationService, { NotificationOptions } from './NotificationService';
import notificationUtils from './notificationUtils';

// Export individual services
export { notificationService, notificationUtils };

// Export our custom types
export type { NotificationOptions } from './NotificationService';

// Export types from Capacitor
export type { 
  PermissionStatus,
  LocalNotificationSchema,
  ActionPerformed,
  PendingLocalNotificationSchema
} from '@capacitor/local-notifications';

// Default export as a bundle of all services
export default {
  notificationService,
  notificationUtils
};
