# Notification Services for Ionic with Capacitor

This directory contains comprehensive notification services built on top of `@capacitor/local-notifications` for use in Ionic applications. These services provide a clean, easy-to-use interface for working with local notifications in your app.

The services include:
1. **NotificationService.ts** - Core service for basic notification functionality
2. **notificationUtils.ts** - Utility functions that extend the core service with advanced features

## Features

- Simple API for scheduling various types of notifications
- Support for basic, scheduled, and repeating notifications
- Custom notification actions
- Notification data payloads
- Permission handling
- Notification event listeners
- Utility methods for managing notifications

## Usage

### Initialization

Initialize the notification service early in your app's lifecycle, typically in a root component like `App.tsx` or in a setup function:

```typescript
import { useEffect } from 'react';
import notificationService from './services/NotificationService';

function App() {
  useEffect(() => {
    const initApp = async () => {
      // Initialize notifications
      await notificationService.initialize();
    };
    
    initApp();
  }, []);
  
  // Rest of your app...
}
```

### Basic Notification

Send a simple notification that appears after a short delay:

```typescript
await notificationService.scheduleNotification(
  "Notification Title",
  "This is the notification message",
  123, // Optional: notification ID
  5    // Optional: delay in seconds (default: 5)
);
```

### Scheduled Notification

Schedule a notification for a specific date and time:

```typescript
const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
await notificationService.scheduleNotificationAt(
  "Scheduled Notification",
  "This notification was scheduled for a specific time",
  scheduledTime
);
```

### Repeating Notification

Create a notification that repeats at regular intervals:

```typescript
await notificationService.scheduleRepeatingNotification(
  "Repeating Notification",
  "This notification will repeat every hour",
  3600 // Interval in seconds (1 hour)
);
```

### Notification with Actions

Add interactive buttons to your notifications:

```typescript
await notificationService.scheduleNotificationWithActions(
  "Action Notification",
  "This notification has custom action buttons",
  [
    { id: "reply", title: "Reply" },
    { id: "dismiss", title: "Dismiss" }
  ]
);
```

### Notification with Data

Include custom data with your notification that can be accessed when the notification is tapped:

```typescript
await notificationService.scheduleNotificationWithData(
  "Data Notification",
  "This notification contains extra data",
  { 
    userId: 123, 
    type: "reminder", 
    priority: "high" 
  }
);
```

### Managing Notifications

Get all pending notifications:

```typescript
const pendingNotifications = await notificationService.getPendingNotifications();
console.log(`You have ${pendingNotifications.length} pending notifications`);
```

Cancel a specific notification:

```typescript
await notificationService.cancelNotification(123); // Cancel notification with ID 123
```

Cancel all notifications:

```typescript
await notificationService.cancelAllNotifications();
```

## Handling Notification Events

The service automatically sets up event listeners for notification events. You can extend these in the `registerActionHandlers` method of the service:

```typescript
// Inside NotificationService.ts
private registerActionHandlers(): void {
  // When a notification is received in the foreground
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('Notification received in foreground:', notification);
    // Custom handling here, e.g., show an in-app alert
  });

  // When a notification is tapped
  LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
    console.log('Notification action performed:', notificationAction);
    // Handle the action, e.g., navigate to a specific page
    const { notification } = notificationAction;
    
    if (notification.extra && notification.extra.type === 'message') {
      // Navigate to messages screen
      // router.push('/messages');
    }
  });
}
```

## Platform Considerations

### iOS

For iOS, you need to ensure that you've properly configured your app to support notifications:

1. Make sure you have the proper entitlements in your app
2. Request permissions early in the app lifecycle
3. Be aware that iOS has stricter notification permissions than Android

### Android

For Android, ensure that:

1. Your app has the proper permissions in the AndroidManifest.xml
2. You've configured notification channels if targeting Android 8.0+
3. You've set up proper icons for notifications

## Best Practices

1. **Request permissions early**: Always request notification permissions during app initialization or at a logical point in the user journey.
2. **Use meaningful notification IDs**: Using consistent IDs makes it easier to update or cancel specific notifications.
3. **Keep content relevant**: Notifications should provide value to the user and not be excessive.
4. **Handle notification taps**: Always provide a clear action when a user taps on a notification.
5. **Test on real devices**: Notification behavior can vary between platforms and emulators.

## Troubleshooting

If notifications aren't working as expected:

1. Check that permissions have been granted
2. Verify that the device isn't in Do Not Disturb mode
3. Ensure the notification time is in the future
4. Check that the notification ID is unique
5. On Android, verify that notification channels are properly configured
6. On iOS, check that the app has been granted notification permissions in system settings

## Advanced Notification Utilities

The `notificationUtils.ts` file provides additional utility functions that extend the core notification service with more advanced features.

### Schedule for Specific Time of Day

Schedule a notification to appear at a specific time of day:

```typescript
import notificationUtils from './services/notificationUtils';

// Schedule for 8:00 PM tonight (or tomorrow if it's already past 8 PM)
await notificationUtils.scheduleForTimeOfDay(
  "Evening Reminder",
  "Don't forget to check your app before bed!",
  20, // 8 PM
  0   // 0 minutes
);
```

### Schedule for Specific Day of Week

Schedule a notification for a specific day of the week:

```typescript
// Schedule for next Saturday at 10:00 AM
await notificationUtils.scheduleForDayOfWeek(
  "Weekend Plans",
  "Have you made plans for the weekend yet?",
  6, // Saturday (0 = Sunday, 6 = Saturday)
  10, // 10 AM
  0   // 0 minutes
);
```

### Countdown Notifications

Create a series of countdown notifications:

```typescript
// Create a 5-minute countdown with notifications every minute
await notificationUtils.scheduleCountdown(
  "Countdown",
  "Time's up! Your countdown is complete.",
  5,     // Count from 5
  60,    // 60 second intervals
  10000  // Base ID
);
```

### Notifications with Snooze

Create a notification with a snooze button:

```typescript
// Create a notification with a 10-minute snooze option
await notificationUtils.scheduleWithSnooze(
  "Important Reminder",
  "This is an important reminder that you can snooze if needed.",
  10 // Snooze for 10 minutes
);
```

### Format Schedule Time

Format a notification schedule time as a human-readable string:

```typescript
const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
const formattedTime = notificationUtils.formatScheduleTime(scheduledTime);
console.log(`Your notification will appear ${formattedTime}`); // "in 1 hour"
```

### Group Notifications by Category

Group notifications by their category:

```typescript
const pendingNotifications = await notificationService.getPendingNotifications();
const groupedNotifications = notificationUtils.groupNotificationsByCategory(
  pendingNotifications,
  'type' // The key in the notification's extra data that contains the category
);

// Now you can display notifications by category
Object.entries(groupedNotifications).forEach(([category, notifications]) => {
  console.log(`Category: ${category}, Count: ${notifications.length}`);
});
```
