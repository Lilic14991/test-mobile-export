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
 * Provides a consistent API for scheduling notifications with various configurations
 */
export interface NotificationOptions {
  /** The notification title displayed to the user */
  title: string;
  
  /** The notification body text */
  body: string;
  
  /** Unique identifier for the notification (auto-generated if not provided) */
  id?: number;
  
  /** Number of seconds to delay before showing the notification */
  delayInSeconds?: number;
  
  /** Specific date and time to show the notification */
  scheduledDateTime?: Date;
  
  /** Whether the notification should repeat */
  repeats?: boolean;
  
  /** Repeat interval if repeats is true */
  every?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  
  /** Number of times to repeat the notification */
  count?: number;
  
  /** Sound to play when the notification is delivered */
  sound?: string;
  
  /** Media attachments to include with the notification */
  attachments?: any[];
  
  /** Interactive actions the user can take on the notification */
  actions?: { id: string; title: string }[];
  
  /** Additional data to include with the notification */
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
  /** Flag to track initialization status */
  private initialized = false;
  
  /**
   * Initialize the notification service
   * This should be called early in the app lifecycle
   * @returns Promise that resolves when initialization is complete
   * @throws Error if initialization fails
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[NotificationService] Already initialized');
      return;
    }
    
    try {
      // Request permissions
      const permissionStatus = await this.requestPermissions();
      
      // Register event listeners
      this.registerActionHandlers();
      
      this.initialized = true;
      console.log('[NotificationService] Initialized successfully', permissionStatus);
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
      throw new Error(`Failed to initialize notification service: ${error instanceof Error ? error.message : String(error)}`);
    }
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
   * Sets up event listeners for notification events
   */
  private registerActionHandlers(): void {
    // Handle when a notification is received while the app is in the foreground
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('[NotificationService] Notification received in foreground:', notification);
      // Custom handling can be added here
      // For example: update UI, play sound, etc.
    });

    // Handle when a notification action is performed (e.g., notification is tapped)
    LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction: ActionPerformed) => {
      const { actionId, notification } = notificationAction;
      console.log('[NotificationService] Notification action performed:', actionId, notification.id);
      
      // Custom handling can be added here
      // For example: navigation, data refresh, etc. based on actionId
    });
  }

  /**
   * Unified method to send a notification
   * @param options Configuration options for the notification
   * @returns Promise that resolves when the notification is scheduled
   * @throws Error if scheduling fails
   */
  async sendNotification(options: NotificationOptions): Promise<void> {
    if (!this.initialized) {
      console.warn('[NotificationService] Service not initialized. Attempting to initialize now...');
      await this.initialize();
    }
    
    try {
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
      const actionTypeId = actions && actions.length > 0 ? 'CUSTOM_ACTIONS' : undefined;
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
      
      console.log(`[NotificationService] Notification scheduled with ID ${id}`);
    } catch (error) {
      console.error('[NotificationService] Failed to schedule notification:', error);
      throw new Error(`Failed to schedule notification: ${error instanceof Error ? error.message : String(error)}`);
    }
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
   * @param enforceExistence If true, throws an error when the notification doesn't exist
   * @returns Promise that resolves when the notification is canceled
   * @throws Error if cancellation fails or notification doesn't exist (when enforceExistence is true)
   */
  async cancelNotification(id: number, enforceExistence: boolean = false): Promise<void> {
    try {
      // Get all currently pending notifications
      const { notifications } = await LocalNotifications.getPending();
      
      const target = notifications.find(n => n.id === id);

      if (!target) {
        const message = `[NotificationService] Cancel: ID ${id} not found in pending notifications.`;
        console.warn(message);
        
        if (enforceExistence) {
          throw new Error(message);
        }
        return;
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
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        // Re-throw the "not found" error without wrapping it
        throw error;
      }
      console.error('[NotificationService] Error canceling notification:', error);
      throw new Error(`Failed to cancel notification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cancel all pending notifications (with verification)
   * @param skipVerification If true, skips the verification step
   * @returns Promise that resolves when all notifications are canceled
   * @throws Error if cancellation fails
   */
  async cancelAllNotifications(skipVerification: boolean = false): Promise<void> {
    try {
      // Get count before cancellation for logging
      const { notifications: beforeCancel } = await LocalNotifications.getPending();
      const countBefore = beforeCancel.length;
      
      // Cancel all scheduled notifications
      await LocalNotifications.cancel({ notifications: [] });
      
      // Skip verification if requested
      if (skipVerification) {
        console.log(`[NotificationService] Canceled ${countBefore} notifications (verification skipped)`);
        return;
      }
      
      // Confirm that all are cleared
      const { notifications: afterCancel } = await LocalNotifications.getPending();

      if (afterCancel.length > 0) {
        throw new Error(`[NotificationService] Failed to cancel all notifications. ${afterCancel.length} remaining.`);
      }

      console.log(`[NotificationService] All ${countBefore} notifications successfully cancelled.`);
    } catch (error) {
      console.error('[NotificationService] Error canceling all notifications:', error);
      throw new Error(`Failed to cancel all notifications: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;
