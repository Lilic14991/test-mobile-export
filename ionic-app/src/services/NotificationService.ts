import { 
  LocalNotifications,
  LocalNotificationSchema,
  ActionPerformed,
  ScheduleOptions,
  PendingLocalNotificationSchema,
  PermissionStatus 
} from '@capacitor/local-notifications';

/**
 * Interface for unified notification options
 */
export interface NotificationOptions {
  title: string;
  body: string;
  id?: number;
  delayInSeconds?: number;
  scheduledDateTime?: Date;
  repeats?: boolean;
  every?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  count?: number;
  sound?: string;
  attachments?: any[];
  actions?: { id: string; title: string }[];
  extra?: Record<string, any> | null;
}

/**
 * NotificationService - A service for managing local notifications in the app
 * 
 * This service provides methods for:
 * - Requesting notification permissions
 * - Scheduling different types of notifications
 * - Handling notification actions
 * - Canceling and managing notifications
 */
class NotificationService {
  /**
   * Initialize the notification service
   * This should be called early in the app lifecycle
   */
  async initialize(): Promise<void> {
    // Request permissions
    await this.requestPermissions();
    
    // Register event listeners
    this.registerActionHandlers();
  }

  /**
   * Request notification permissions from the user
   * @returns Permission status
   */
  async requestPermissions(): Promise<PermissionStatus> {
    return await LocalNotifications.requestPermissions();
  }

  /**
   * Check if notifications are permitted
   * @returns Permission status
   */
  async checkPermissions(): Promise<PermissionStatus> {
    return await LocalNotifications.checkPermissions();
  }

  /**
   * Register handlers for notification actions
   */
  private registerActionHandlers(): void {
    // Handle when a notification is received while the app is in the foreground
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received in foreground:', notification);
      // You can add custom handling here
    });

    // Handle when a notification action is performed (e.g., notification is tapped)
    LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
      console.log('Notification action performed:', notificationAction);
      // You can add custom handling here, such as navigation
    });
  }

  /**
   * Unified method to send a notification
   */
  async sendNotification(options: NotificationOptions): Promise<void> {
    const {
      title,
      body,
      id = Math.floor(Math.random() * 10000),
      delayInSeconds,
      scheduledDateTime,
      repeats = false,
      every,
      count,
      sound = 'default',
      attachments,
      actions,
      extra,
    } = options;

    // Prepare schedule object
    const at =
      scheduledDateTime ??
      (delayInSeconds != null ? new Date(Date.now() + delayInSeconds * 1000) : new Date());

    const schedule = {
      at,
      repeats,
      every,
      count,
    };

    // Register actions if present
    const actionTypeId = actions ? 'CUSTOM_ACTIONS' : undefined;
    if (actions && actions.length > 0) {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'CUSTOM_ACTIONS',
            actions,
          },
        ],
      });
    }

    // Schedule the notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule,
          sound,
          attachments,
          extra,
          actionTypeId,
        },
      ],
    });
  }

  /**
   * Get all pending notifications
   * @returns Array of pending notifications
   */
  async getPendingNotifications(): Promise<PendingLocalNotificationSchema[]> {
    const { notifications } = await LocalNotifications.getPending();
    return notifications;
  }

  /**
   * Cancel a specific notification by ID
   * @param id Notification ID to cancel
   */
  async cancelNotification(id: number): Promise<void> {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }

  /**
   * Cancel all pending notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await LocalNotifications.cancel({ notifications: [] });
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;
