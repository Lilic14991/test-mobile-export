# Capacitor Local Notifications Implementation

This document provides an overview of how local notifications are implemented in this Ionic app using `@capacitor/local-notifications`.

## Overview

The implementation consists of:

1. A core notification service (`src/services/NotificationService.ts`)
2. Utility functions for advanced notification features (`src/services/notificationUtils.ts`)
3. A demo UI for testing notifications (`src/pages/Tab1.tsx`)
4. App-level initialization of the notification service (`src/App.tsx`)

## Getting Started

### Prerequisites

The app uses the following Capacitor plugins:

- `@capacitor/core`
- `@capacitor/local-notifications`

These are already installed in the project. If you're starting a new project, you can install them with:

```bash
npm install @capacitor/core @capacitor/local-notifications
```

### Initialization

The notification service is initialized in `App.tsx` to ensure that permissions are requested early in the app lifecycle and that event listeners are set up properly:

```typescript
// In App.tsx
useEffect(() => {
  const initApp = async () => {
    try {
      // Initialize notifications
      await notificationService.initialize();
      console.log("Notification service initialized");
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
    }
  };
  
  initApp();
}, []);
```

## Core Features

### Basic Notifications

Send simple notifications that appear after a short delay:

```typescript
await notificationService.scheduleNotification(
  "Basic Notification",
  "This is a simple notification from your Ionic app!",
  Math.floor(Math.random() * 10000), // Random ID
  2 // Show after 2 seconds
);
```

### Scheduled Notifications

Schedule notifications for a specific date and time:

```typescript
const scheduledTime = new Date(Date.now() + 60000); // 1 minute from now
await notificationService.scheduleNotificationAt(
  "Scheduled Notification",
  `This notification was scheduled for ${scheduledTime.toLocaleTimeString()}`,
  scheduledTime
);
```

### Repeating Notifications

Create notifications that repeat at regular intervals:

```typescript
await notificationService.scheduleRepeatingNotification(
  "Repeating Notification",
  "This notification will repeat every hour",
  3600 // 1 hour in seconds
);
```

### Notifications with Actions

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

### Notifications with Data

Include custom data with your notifications:

```typescript
await notificationService.scheduleNotificationWithData(
  "Data Notification",
  "This notification contains extra data",
  { userId: 123, type: "reminder", priority: "high" }
);
```

## Advanced Features

### Time-Based Notifications

Schedule notifications for specific times of day or days of the week:

```typescript
// Schedule for 8:00 PM tonight
await notificationUtils.scheduleForTimeOfDay(
  "Evening Reminder",
  "Don't forget to check your app before bed!",
  20, // 8 PM
  0   // 0 minutes
);

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
await notificationUtils.scheduleCountdown(
  "Countdown",
  "Time's up! Your countdown is complete.",
  5,    // Count from 5
  1,    // 1 second interval
  20000 // Base ID
);
```

### Notifications with Snooze

Create notifications with a snooze option:

```typescript
await notificationUtils.scheduleWithSnooze(
  "Important Reminder",
  "This is an important reminder that you can snooze if needed.",
  5 // Snooze for 5 minutes
);
```

## Managing Notifications

### Get Pending Notifications

Retrieve all pending notifications:

```typescript
const notifications = await notificationService.getPendingNotifications();
console.log(`You have ${notifications.length} pending notifications`);
```

### Cancel Notifications

Cancel a specific notification or all notifications:

```typescript
// Cancel a specific notification
await notificationService.cancelNotification(123);

// Cancel all notifications
await notificationService.cancelAllNotifications();
```

## Handling Notification Events

The notification service sets up event listeners for notification events:

```typescript
// When a notification is received in the foreground
LocalNotifications.addListener('localNotificationReceived', (notification) => {
  console.log('Notification received in foreground:', notification);
  // Custom handling here
});

// When a notification action is performed (e.g., notification is tapped)
LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
  console.log('Notification action performed:', notificationAction);
  // Custom handling here, such as navigation
});
```

## Platform-Specific Considerations

### Android

For Android, you may need to configure notification channels in your `AndroidManifest.xml` file for Android 8.0+ (API level 26+). The Capacitor plugin handles most of this automatically, but you may want to customize the channels for your specific needs.

### iOS

For iOS, you need to ensure that you have the proper entitlements in your app. The Capacitor plugin handles requesting permissions, but you should be aware that iOS has stricter notification permissions than Android.

## Testing

The app includes a demo UI in `Tab1.tsx` that allows you to test various types of notifications. You can use this to verify that notifications are working correctly on your device.

## Troubleshooting

If notifications aren't working as expected:

1. Check that permissions have been granted (use the "Request Permissions" button in the demo UI)
2. Verify that the device isn't in Do Not Disturb mode
3. Ensure the notification time is in the future
4. Check that the notification ID is unique
5. On Android, verify that notification channels are properly configured
6. On iOS, check that the app has been granted notification permissions in system settings

## Further Resources

- [Capacitor Local Notifications Documentation](https://capacitorjs.com/docs/apis/local-notifications)
- [Ionic Framework Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
