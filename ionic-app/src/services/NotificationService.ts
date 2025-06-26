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
    * Cancel a specific notification by ID (with verification)
    * @param id Notification ID to cancel
    */
    async cancelNotification(id: number): Promise<void> {
      // Get all currently pending notifications
      const { notifications } = await LocalNotifications.getPending();
      
      const target = notifications.find(n => n.id === id);

      if (!target) {
        console.warn(`[NotificationService] Cancel: ID ${id} not found in pending notifications.`);
        return; // Optionally throw if you want to enforce existence
      }

      // Attempt to cancel the notification
      await LocalNotifications.cancel({ notifications: [{ id }] });

      // Verify cancellation
      const { notifications: afterCancel } = await LocalNotifications.getPending();
      const stillExists = afterCancel.some(n => n.id === id);

      if (stillExists) {
        throw new Error(`[NotificationService] Failed to cancel notification ID ${id}`);
      }

      console.log(`[NotificationService] Notification ID ${id} successfully cancelled.`);
    }

    /**
    * Cancel all pending notifications (with optional confirmation)
    */
    async cancelAllNotifications(): Promise<void> {
      // Cancel all scheduled notifications
      await LocalNotifications.cancel({ notifications: [] });
      // Confirm that all are cleared
      const { notifications: afterCancel } = await LocalNotifications.getPending();

      if (afterCancel.length > 0) {
        throw new Error(`[NotificationService] Failed to cancel all notifications. ${afterCancel.length} remaining.`);
      }

      console.log("[NotificationService] All notifications successfully cancelled.");
    }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;
