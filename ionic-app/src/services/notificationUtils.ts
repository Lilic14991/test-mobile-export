/**
 * Notification Utilities
 * 
 * This file contains utility functions for working with notifications
 * that extend the core functionality of the NotificationService.
 * 
 * These utilities provide higher-level abstractions for common notification patterns
 * such as scheduling for specific times, creating countdowns, and handling snooze functionality.
 */

import notificationService, { NotificationOptions } from './NotificationService';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';

/**
 * Schedule a notification for a specific time of day
 * @param title Notification title
 * @param body Notification body
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 * @param id Optional notification ID
 * @returns Promise that resolves when the notification is scheduled
 * @throws Error if scheduling fails
 */
export const scheduleForTimeOfDay = async (
  title: string,
  body: string,
  hour: number,
  minute: number,
  id?: number
): Promise<void> => {
  try {
    // Validate input parameters
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }
    
    if (minute < 0 || minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }
    
    // Create a Date object for today at the specified time
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime.getTime() < Date.now()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    await notificationService.sendNotification({
      title,
      body,
      id,
      scheduledDateTime: scheduledTime
    });
    
    console.log(`[NotificationUtils] Scheduled notification for ${scheduledTime.toLocaleString()}`);
  } catch (error) {
    console.error('[NotificationUtils] Failed to schedule time-of-day notification:', error);
    throw new Error(`Failed to schedule notification: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Schedule a notification for a specific day of the week
 * @param title Notification title
 * @param body Notification body
 * @param dayOfWeek Day of week (0-6, where 0 is Sunday)
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 * @param id Optional notification ID
 * @returns Promise that resolves when the notification is scheduled
 * @throws Error if scheduling fails or parameters are invalid
 */
export const scheduleForDayOfWeek = async (
  title: string,
  body: string,
  dayOfWeek: number,
  hour: number,
  minute: number,
  id?: number
): Promise<void> => {
  try {
    // Validate input parameters
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }
    
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }
    
    if (minute < 0 || minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }
    
    // Create a Date object for the next occurrence of the specified day
    const now = new Date();
    const scheduledTime = new Date();
    const currentDayOfWeek = now.getDay();
    
    // Calculate days to add to get to the target day of week
    let daysToAdd = dayOfWeek - currentDayOfWeek;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // If it's today or earlier in the week, go to next week
    }
    
    scheduledTime.setDate(now.getDate() + daysToAdd);
    scheduledTime.setHours(hour, minute, 0, 0);
    
    await notificationService.sendNotification({
      title,
      body,
      id,
      scheduledDateTime: scheduledTime
    });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log(`[NotificationUtils] Scheduled notification for next ${dayNames[dayOfWeek]} at ${hour}:${minute.toString().padStart(2, '0')}`);
  } catch (error) {
    console.error('[NotificationUtils] Failed to schedule day-of-week notification:', error);
    throw new Error(`Failed to schedule notification: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Schedule a countdown notification series
 * @param title Base title for the notifications
 * @param finalMessage Message for the final notification
 * @param countFrom Start counting from this number
 * @param intervalSeconds Seconds between each count
 * @param baseId Starting ID for the notification series
 * @returns Promise that resolves when all notifications are scheduled
 * @throws Error if scheduling fails
 */
export const scheduleCountdown = async (
  title: string,
  finalMessage: string,
  countFrom: number = 5,
  intervalSeconds: number = 60,
  baseId: number = 10000
): Promise<void> => {
  try {
    // Validate input parameters
    if (countFrom <= 0) {
      throw new Error('Count must be greater than 0');
    }
    
    if (intervalSeconds <= 0) {
      throw new Error('Interval must be greater than 0 seconds');
    }
    
    const scheduledNotifications = [];
    
    // Schedule countdown notifications
    for (let i = countFrom; i > 0; i--) {
      const scheduledTime = new Date(Date.now() + intervalSeconds * (countFrom - i + 1) * 1000);
      
      scheduledNotifications.push(
        notificationService.sendNotification({
          title: `${title} - ${i}`,
          body: `${i} ${i === 1 ? 'minute' : 'minutes'} remaining`,
          id: baseId + i,
          scheduledDateTime: scheduledTime
        })
      );
    }
    
    // Schedule the final notification
    const finalTime = new Date(Date.now() + intervalSeconds * (countFrom + 1) * 1000);
    scheduledNotifications.push(
      notificationService.sendNotification({
        title,
        body: finalMessage,
        id: baseId,
        scheduledDateTime: finalTime
      })
    );
    
    // Wait for all notifications to be scheduled
    await Promise.all(scheduledNotifications);
    
    console.log(`[NotificationUtils] Scheduled countdown series with ${countFrom} notifications`);
  } catch (error) {
    console.error('[NotificationUtils] Failed to schedule countdown notifications:', error);
    throw new Error(`Failed to schedule countdown: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Schedule a notification with a snooze option
 * @param title Notification title
 * @param body Notification body
 * @param snoozeMinutes Minutes to snooze for
 * @param id Notification ID
 * @returns Promise that resolves when the notification is scheduled
 * @throws Error if scheduling fails
 */
export const scheduleWithSnooze = async (
  title: string,
  body: string,
  snoozeMinutes: number = 10,
  id: number = Math.floor(Math.random() * 10000)
): Promise<void> => {
  try {
    // Validate input parameters
    if (snoozeMinutes <= 0) {
      throw new Error('Snooze minutes must be greater than 0');
    }
    
    // Schedule the initial notification with snooze action
    await notificationService.sendNotification({
      title,
      body,
      id,
      actions: [
        { id: 'snooze', title: `Snooze ${snoozeMinutes} min` },
        { id: 'dismiss', title: 'Dismiss' }
      ],
      scheduledDateTime: new Date(Date.now() + 5000) // Show in 5 seconds
    });
    
    // Set up a listener for the snooze action
    const actionListener = await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (notificationAction: ActionPerformed) => {
        const { actionId, notification } = notificationAction;
        
        // If the snooze action was selected
        if (actionId === 'snooze' && notification.id === id) {
          try {
            // Schedule a new notification after the snooze period
            const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);
            await notificationService.sendNotification({
              title: `${title} (Snoozed)`,
              body,
              id: id + 1, // Use a different ID to avoid conflicts
              scheduledDateTime: snoozeTime
            });
            
            console.log(`[NotificationUtils] Notification snoozed for ${snoozeMinutes} minutes`);
          } catch (error) {
            console.error('[NotificationUtils] Error scheduling snoozed notification:', error);
          } finally {
            // Remove this listener to avoid memory leaks
            actionListener.remove();
          }
        } else if (actionId === 'dismiss' && notification.id === id) {
          // Remove the listener when dismissed
          actionListener.remove();
        }
      }
    );
    
    console.log(`[NotificationUtils] Scheduled notification with snooze option (ID: ${id})`);
  } catch (error) {
    console.error('[NotificationUtils] Failed to schedule notification with snooze:', error);
    throw new Error(`Failed to schedule notification with snooze: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Format a notification schedule as a human-readable string
 * @param date The scheduled date
 * @returns A human-readable string describing when the notification will appear
 */
export const formatScheduleTime = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'at an invalid date';
  }
  
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  // Handle past dates
  if (diffMs < 0) {
    return `${Math.abs(Math.floor(diffMs / 1000))} seconds ago`;
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return `in ${diffSec} second${diffSec !== 1 ? 's' : ''}`;
  } else if (diffMin < 60) {
    return `in ${diffMin} minute${diffMin !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else {
    // Format date with day name for better readability
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return `on ${date.toLocaleDateString(undefined, options)}`;
  }
};

/**
 * Group notifications by category
 * @param notifications Array of notification objects
 * @param categoryKey The key in the extra data that contains the category
 * @returns An object with notifications grouped by category
 */
export const groupNotificationsByCategory = (
  notifications: any[],
  categoryKey: string = 'category'
): Record<string, any[]> => {
  if (!Array.isArray(notifications)) {
    console.warn('[NotificationUtils] groupNotificationsByCategory received non-array input');
    return { uncategorized: [] };
  }
  
  const grouped: Record<string, any[]> = {};
  
  notifications.forEach(notification => {
    // Determine the category from the notification's extra data
    const category = notification?.extra && notification.extra[categoryKey] 
      ? notification.extra[categoryKey] 
      : 'uncategorized';
    
    // Initialize the category array if it doesn't exist
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    // Add the notification to its category
    grouped[category].push(notification);
  });
  
  return grouped;
};

/**
 * Notification utilities object for named imports
 */
export default {
  scheduleForTimeOfDay,
  scheduleForDayOfWeek,
  scheduleCountdown,
  scheduleWithSnooze,
  formatScheduleTime,
  groupNotificationsByCategory
};
