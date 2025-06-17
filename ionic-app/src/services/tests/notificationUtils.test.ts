import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import notificationUtils from '../notificationUtils';
import notificationService from '../NotificationService';
import { LocalNotifications } from '@capacitor/local-notifications';

// Mock the notification service
vi.mock('../NotificationService', () => {
  return {
    default: {
      scheduleNotification: vi.fn().mockResolvedValue(undefined),
      scheduleNotificationAt: vi.fn().mockResolvedValue(undefined),
      scheduleNotificationWithActions: vi.fn().mockResolvedValue(undefined),
    }
  };
});

// Mock the Capacitor LocalNotifications plugin
vi.mock('@capacitor/local-notifications', () => {
  return {
    LocalNotifications: {
      addListener: vi.fn().mockResolvedValue({
        remove: vi.fn()
      })
    }
  };
});

describe('notificationUtils', () => {
  // Mock Date.now() to return a consistent value for testing
  const mockNow = new Date('2025-01-01T12:00:00Z').getTime();
  const originalDateNow = Date.now;
  
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    Date.now = vi.fn(() => mockNow);
    
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore the original Date.now
    Date.now = originalDateNow;
    
    // Reset all mocks after each test
    vi.resetAllMocks();
  });

  describe('scheduleForTimeOfDay', () => {
    it('should schedule a notification for later today if the time has not passed', async () => {
      // Set up a time that is later today (3:00 PM)
      const hour = 15;
      const minute = 0;
      
      await notificationUtils.scheduleForTimeOfDay('Test', 'Message', hour, minute);
      
      // Create the expected scheduled time
      const expectedTime = new Date(mockNow);
      expectedTime.setHours(hour, minute, 0, 0);
      
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledTimes(1);
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledWith(
        'Test',
        'Message',
        expectedTime,
        undefined
      );
    });

    it('should schedule a notification for tomorrow if the time has already passed today', async () => {
      // Set up a time that has already passed today (9:00 AM)
      const hour = 9;
      const minute = 0;
      
      await notificationUtils.scheduleForTimeOfDay('Test', 'Message', hour, minute);
      
      // Create the expected scheduled time (tomorrow at 9:00 AM)
      const expectedTime = new Date(mockNow);
      expectedTime.setHours(hour, minute, 0, 0);
      expectedTime.setDate(expectedTime.getDate() + 1); // Add one day
      
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledTimes(1);
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledWith(
        'Test',
        'Message',
        expectedTime,
        undefined
      );
    });
  });

  describe('scheduleForDayOfWeek', () => {
    it('should schedule a notification for the next occurrence of the specified day', async () => {
      // Mock the current day to be Wednesday (3)
      const mockDate = new Date(mockNow);
      mockDate.setDate(1); // January 1, 2025 is a Wednesday
      Date.now = vi.fn(() => mockDate.getTime());
      
      // Schedule for next Saturday (6)
      const dayOfWeek = 6;
      const hour = 10;
      const minute = 0;
      
      await notificationUtils.scheduleForDayOfWeek('Test', 'Message', dayOfWeek, hour, minute);
      
      // Create the expected scheduled time (Saturday at 10:00 AM)
      // From Wednesday to Saturday is 3 days
      const expectedTime = new Date(mockDate);
      expectedTime.setDate(expectedTime.getDate() + 3);
      expectedTime.setHours(hour, minute, 0, 0);
      
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledTimes(1);
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledWith(
        'Test',
        'Message',
        expectedTime,
        undefined
      );
    });

    it('should schedule for next week if the day is today or earlier in the week', async () => {
      // Mock the current day to be Saturday (6)
      const mockDate = new Date(mockNow);
      mockDate.setDate(4); // January 4, 2025 is a Saturday
      Date.now = vi.fn(() => mockDate.getTime());
      
      // Schedule for Wednesday (3), which was earlier this week
      const dayOfWeek = 3;
      const hour = 10;
      const minute = 0;
      
      await notificationUtils.scheduleForDayOfWeek('Test', 'Message', dayOfWeek, hour, minute);
      
      // Create the expected scheduled time (next Wednesday at 10:00 AM)
      // From Saturday to next Wednesday is 4 days (Saturday -> Sunday -> Monday -> Tuesday -> Wednesday)
      const expectedTime = new Date(mockDate);
      expectedTime.setDate(expectedTime.getDate() + 4);
      expectedTime.setHours(hour, minute, 0, 0);
      
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledTimes(1);
      expect(notificationService.scheduleNotificationAt).toHaveBeenCalledWith(
        'Test',
        'Message',
        expectedTime,
        undefined
      );
    });
  });

  describe('scheduleCountdown', () => {
    it('should schedule a series of countdown notifications', async () => {
      await notificationUtils.scheduleCountdown(
        'Countdown',
        'Final message',
        3, // Count from 3
        60, // 60 second intervals
        1000 // Base ID
      );
      
      // Should have called scheduleNotification 4 times (3 countdown + 1 final)
      expect(notificationService.scheduleNotification).toHaveBeenCalledTimes(4);
      
      // Check the countdown notifications
      expect(notificationService.scheduleNotification).toHaveBeenCalledWith(
        'Countdown - 3',
        '3 minutes remaining',
        1003,
        60
      );
      
      expect(notificationService.scheduleNotification).toHaveBeenCalledWith(
        'Countdown - 2',
        '2 minutes remaining',
        1002,
        120
      );
      
      expect(notificationService.scheduleNotification).toHaveBeenCalledWith(
        'Countdown - 1',
        '1 minute remaining',
        1001,
        180
      );
      
      // Check the final notification
      expect(notificationService.scheduleNotification).toHaveBeenCalledWith(
        'Countdown',
        'Final message',
        1000,
        240
      );
    });
  });

  describe('scheduleWithSnooze', () => {
    it('should schedule a notification with snooze action', async () => {
      await notificationUtils.scheduleWithSnooze(
        'Test',
        'Message',
        10, // Snooze for 10 minutes
        123 // ID
      );
      
      // Should have scheduled a notification with actions
      expect(notificationService.scheduleNotificationWithActions).toHaveBeenCalledTimes(1);
      expect(notificationService.scheduleNotificationWithActions).toHaveBeenCalledWith(
        'Test',
        'Message',
        [
          { id: 'snooze', title: 'Snooze 10 min' },
          { id: 'dismiss', title: 'Dismiss' }
        ],
        123
      );
      
      // Should have set up a listener for the action
      expect(LocalNotifications.addListener).toHaveBeenCalledTimes(1);
      expect(LocalNotifications.addListener).toHaveBeenCalledWith(
        'localNotificationActionPerformed',
        expect.any(Function)
      );
    });
  });

  describe('formatScheduleTime', () => {
    it('should format time in seconds when less than a minute', () => {
      const date = new Date(mockNow + 30 * 1000); // 30 seconds from now
      const result = notificationUtils.formatScheduleTime(date);
      expect(result).toBe('in 30 seconds');
    });

    it('should format time in minutes when less than an hour', () => {
      const date = new Date(mockNow + 30 * 60 * 1000); // 30 minutes from now
      const result = notificationUtils.formatScheduleTime(date);
      expect(result).toBe('in 30 minutes');
    });

    it('should format time in hours when less than a day', () => {
      const date = new Date(mockNow + 5 * 60 * 60 * 1000); // 5 hours from now
      const result = notificationUtils.formatScheduleTime(date);
      expect(result).toBe('in 5 hours');
    });

    it('should format time in days when less than a week', () => {
      const date = new Date(mockNow + 3 * 24 * 60 * 60 * 1000); // 3 days from now
      const result = notificationUtils.formatScheduleTime(date);
      expect(result).toBe('in 3 days');
    });

    it('should format as date and time when more than a week away', () => {
      const date = new Date(mockNow + 10 * 24 * 60 * 60 * 1000); // 10 days from now
      const result = notificationUtils.formatScheduleTime(date);
      expect(result).toContain('on ');
      expect(result).toContain(' at ');
    });
  });

  describe('groupNotificationsByCategory', () => {
    it('should group notifications by the specified category key', () => {
      const notifications = [
        { id: 1, title: 'Notification 1', extra: { category: 'reminder' } },
        { id: 2, title: 'Notification 2', extra: { category: 'alert' } },
        { id: 3, title: 'Notification 3', extra: { category: 'reminder' } },
        { id: 4, title: 'Notification 4', extra: { category: 'message' } },
        { id: 5, title: 'Notification 5', extra: null }
      ];
      
      const result = notificationUtils.groupNotificationsByCategory(notifications);
      
      expect(result).toEqual({
        reminder: [
          { id: 1, title: 'Notification 1', extra: { category: 'reminder' } },
          { id: 3, title: 'Notification 3', extra: { category: 'reminder' } }
        ],
        alert: [
          { id: 2, title: 'Notification 2', extra: { category: 'alert' } }
        ],
        message: [
          { id: 4, title: 'Notification 4', extra: { category: 'message' } }
        ],
        uncategorized: [
          { id: 5, title: 'Notification 5', extra: null }
        ]
      });
    });

    it('should use a custom category key if provided', () => {
      const notifications = [
        { id: 1, title: 'Notification 1', extra: { type: 'reminder' } },
        { id: 2, title: 'Notification 2', extra: { type: 'alert' } },
        { id: 3, title: 'Notification 3', extra: { type: 'reminder' } }
      ];
      
      const result = notificationUtils.groupNotificationsByCategory(notifications, 'type');
      
      expect(result).toEqual({
        reminder: [
          { id: 1, title: 'Notification 1', extra: { type: 'reminder' } },
          { id: 3, title: 'Notification 3', extra: { type: 'reminder' } }
        ],
        alert: [
          { id: 2, title: 'Notification 2', extra: { type: 'alert' } }
        ]
      });
    });
  });
});
