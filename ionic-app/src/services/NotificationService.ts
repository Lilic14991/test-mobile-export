import { 
  LocalNotifications,
  LocalNotificationSchema,
  ActionPerformed,
  ScheduleOptions,
  PendingLocalNotificationSchema,
  PermissionStatus 
} from '@capacitor/local-notifications';

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
   * Schedule a simple notification
   * @param title Notification title
   * @param body Notification body text
   * @param id Unique notification ID
   * @param delayInSeconds Delay in seconds before showing the notification
   * @returns Promise that resolves when the notification is scheduled
   */
  async scheduleNotification(
    title: string,
    body: string,
    id: number = Math.floor(Math.random() * 10000),
    delayInSeconds: number = 5
  ): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: new Date(Date.now() + delayInSeconds * 1000) },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }

  /**
   * Schedule a notification with a specific date and time
   * @param title Notification title
   * @param body Notification body text
   * @param scheduledDateTime Date and time to show the notification
   * @param id Unique notification ID
   * @returns Promise that resolves when the notification is scheduled
   */
  async scheduleNotificationAt(
    title: string,
    body: string,
    scheduledDateTime: Date,
    id: number = Math.floor(Math.random() * 10000)
  ): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: scheduledDateTime },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }

  /**
   * Schedule a repeating notification
   * @param title Notification title
   * @param body Notification body text
   * @param interval Repeat interval in seconds
   * @param id Unique notification ID
   * @returns Promise that resolves when the notification is scheduled
   */
  async scheduleRepeatingNotification(
    title: string,
    body: string,
    interval: number = 3600, // Default: 1 hour
    id: number = Math.floor(Math.random() * 10000)
  ): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { 
            at: new Date(Date.now() + 10000), // Start after 10 seconds
            repeats: true,
            every: 'hour' // 'minute', 'hour', 'day', 'week', 'month', 'year'
          },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }

  /**
   * Schedule a notification with custom actions
   * @param title Notification title
   * @param body Notification body text
   * @param actions Array of action buttons
   * @param id Unique notification ID
   * @returns Promise that resolves when the notification is scheduled
   */
  async scheduleNotificationWithActions(
    title: string,
    body: string,
    actions: { id: string; title: string }[],
    id: number = Math.floor(Math.random() * 10000)
  ): Promise<void> {
    // First, register the action types
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'CUSTOM_ACTIONS',
          actions
        }
      ]
    });

    // Then schedule the notification with the action type
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: new Date(Date.now() + 5000) },
          sound: 'default',
          attachments: undefined,
          actionTypeId: 'CUSTOM_ACTIONS',
          extra: null
        }
      ]
    });
  }

  /**
   * Schedule a notification with extra data
   * @param title Notification title
   * @param body Notification body text
   * @param extraData Additional data to include with the notification
   * @param id Unique notification ID
   * @returns Promise that resolves when the notification is scheduled
   */
  async scheduleNotificationWithData(
    title: string,
    body: string,
    extraData: Record<string, any>,
    id: number = Math.floor(Math.random() * 10000)
  ): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: new Date(Date.now() + 5000) },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: extraData
        }
      ]
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
