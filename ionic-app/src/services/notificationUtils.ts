/**
 * Notification Utilities
 * 
 * This file contains utility functions for working with notifications
 * that extend the core functionality of the NotificationService.
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
 */
export const scheduleForTimeOfDay = async (
  title: string,
  body: string,
  hour: number,
  minute: number,
  id?: number
): Promise<void> => {
  // Create a Date object for today at the specified time
  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (scheduledTime.getTime() < Date.now()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  await notificationService.schedule({
    title,
    body,
    id,
    schedule: { at: scheduledTime }
  });
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
 */
export const scheduleForDayOfWeek = async (
  title: string,
  body: string,
  dayOfWeek: number,
  hour: number,
  minute: number,
  id?: number
): Promise<void> => {
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
  
  await notificationService.schedule({
    title,
    body,
    id,
    schedule: { at: scheduledTime }
  });
};

/**
 * Schedule a countdown notification series
 * @param title Base title for the notifications
 * @param finalMessage Message for the final notification
 * @param countFrom Start counting from this number
 * @param intervalSeconds Seconds between each count
 * @param baseId Starting ID for the notification series
 * @returns Promise that resolves when all notifications are scheduled
 */
export const scheduleCountdown = async (
  title: string,
  finalMessage: string,
  countFrom: number = 5,
  intervalSeconds: number = 60,
  baseId: number = 10000
): Promise<void> => {
  // Schedule countdown notifications
  for (let i = countFrom; i > 0; i--) {
    await notificationService.schedule({
      title: `${title} - ${i}`,
      body: `${i} ${i === 1 ? 'minute' : 'minutes'} remaining`,
      id: baseId + i,
      schedule: { at: new Date(Date.now() + intervalSeconds * (countFrom - i + 1) * 1000) }
    });
  }
  
  // Schedule the final notification
  await notificationService.schedule({
    title,
    body: finalMessage,
    id: baseId,
    schedule: { at: new Date(Date.now() + intervalSeconds * (countFrom + 1) * 1000) }
  });
};

/**
 * Schedule a notification with a snooze option
 * @param title Notification title
 * @param body Notification body
 * @param snoozeMinutes Minutes to snooze for
 * @param id Notification ID
 * @returns Promise that resolves when the notification is scheduled
 */
export const scheduleWithSnooze = async (
  title: string,
  body: string,
  snoozeMinutes: number = 10,
  id: number = Math.floor(Math.random() * 10000)
): Promise<void> => {
  // Register a custom action type for snooze
  await notificationService.schedule({
    title,
    body,
    id,
    actions: [
      { id: 'snooze', title: `Snooze ${snoozeMinutes} min` },
      { id: 'dismiss', title: 'Dismiss' }
    ],
    schedule: { at: new Date(Date.now() + 5000) }
  });
  
  // Set up a listener for the snooze action
  const actionListener = await LocalNotifications.addListener(
    'localNotificationActionPerformed',
    async (notificationAction: ActionPerformed) => {
      const { actionId, notification } = notificationAction;
      
      // If the snooze action was selected
      if (actionId === 'snooze' && notification.id === id) {
        // Schedule a new notification after the snooze period
        const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);
        await notificationService.schedule({
          title: `${title} (Snoozed)`,
          body,
          id: id + 1, // Use a different ID to avoid conflicts
          schedule: { at: snoozeTime }
        });
        
        // Remove this listener to avoid memory leaks
        actionListener.remove();
      }
    }
  );
};

/**
 * Format a notification schedule as a human-readable string
 * @param date The scheduled date
 * @returns A human-readable string describing when the notification will appear
 */
export const formatScheduleTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return `in ${diffSec} seconds`;
  } else if (diffMin < 60) {
    return `in ${diffMin} minutes`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hours`;
  } else if (diffDays < 7) {
    return `in ${diffDays} days`;
  } else {
    return `on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
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
  const grouped: Record<string, any[]> = {};
  
  notifications.forEach(notification => {
    const category = notification.extra && notification.extra[categoryKey] 
      ? notification.extra[categoryKey] 
      : 'uncategorized';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(notification);
  });
  
  return grouped;
};

export default {
  scheduleForTimeOfDay,
  scheduleForDayOfWeek,
  scheduleCountdown,
  scheduleWithSnooze,
  formatScheduleTime,
  groupNotificationsByCategory
};
