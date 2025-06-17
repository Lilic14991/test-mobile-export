import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import notificationService from '../NotificationService';
import { LocalNotifications } from '@capacitor/local-notifications';

// Mock the Capacitor LocalNotifications plugin
vi.mock('@capacitor/local-notifications', () => {
  return {
    LocalNotifications: {
      requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
      checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
      schedule: vi.fn().mockResolvedValue({}),
      getPending: vi.fn().mockResolvedValue({ notifications: [] }),
      cancel: vi.fn().mockResolvedValue({}),
      registerActionTypes: vi.fn().mockResolvedValue({}),
      addListener: vi.fn().mockResolvedValue({
        remove: vi.fn()
      })
    }
  };
});

describe('NotificationService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset all mocks after each test
    vi.resetAllMocks();
  });

  it('should initialize correctly', async () => {
    await notificationService.initialize();
    
    // Verify that requestPermissions was called
    expect(LocalNotifications.requestPermissions).toHaveBeenCalledTimes(1);
    
    // Verify that addListener was called for notification events
    expect(LocalNotifications.addListener).toHaveBeenCalledTimes(2);
    expect(LocalNotifications.addListener).toHaveBeenCalledWith(
      'localNotificationReceived',
      expect.any(Function)
    );
    expect(LocalNotifications.addListener).toHaveBeenCalledWith(
      'localNotificationActionPerformed',
      expect.any(Function)
    );
  });

  it('should request permissions', async () => {
    const result = await notificationService.requestPermissions();
    
    expect(LocalNotifications.requestPermissions).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ display: 'granted' });
  });

  it('should check permissions', async () => {
    const result = await notificationService.checkPermissions();
    
    expect(LocalNotifications.checkPermissions).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ display: 'granted' });
  });

  it('should schedule a basic notification', async () => {
    const title = 'Test Notification';
    const body = 'This is a test notification';
    const id = 123;
    const delayInSeconds = 5;
    
    await notificationService.scheduleNotification(title, body, id, delayInSeconds);
    
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          title,
          body,
          id,
          schedule: expect.any(Object)
        })
      ]
    });
  });

  it('should schedule a notification at a specific time', async () => {
    const title = 'Scheduled Notification';
    const body = 'This is a scheduled notification';
    const scheduledTime = new Date();
    const id = 456;
    
    await notificationService.scheduleNotificationAt(title, body, scheduledTime, id);
    
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          title,
          body,
          id,
          schedule: { at: scheduledTime }
        })
      ]
    });
  });

  it('should schedule a repeating notification', async () => {
    const title = 'Repeating Notification';
    const body = 'This is a repeating notification';
    const interval = 3600; // 1 hour
    const id = 789;
    
    await notificationService.scheduleRepeatingNotification(title, body, interval, id);
    
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          title,
          body,
          id,
          schedule: expect.objectContaining({
            repeats: true,
            every: 'hour'
          })
        })
      ]
    });
  });

  it('should schedule a notification with actions', async () => {
    const title = 'Action Notification';
    const body = 'This notification has actions';
    const actions = [
      { id: 'reply', title: 'Reply' },
      { id: 'dismiss', title: 'Dismiss' }
    ];
    const id = 101;
    
    await notificationService.scheduleNotificationWithActions(title, body, actions, id);
    
    // Verify that action types were registered
    expect(LocalNotifications.registerActionTypes).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.registerActionTypes).toHaveBeenCalledWith({
      types: [
        {
          id: 'CUSTOM_ACTIONS',
          actions
        }
      ]
    });
    
    // Verify that the notification was scheduled with the action type
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          title,
          body,
          id,
          actionTypeId: 'CUSTOM_ACTIONS'
        })
      ]
    });
  });

  it('should schedule a notification with extra data', async () => {
    const title = 'Data Notification';
    const body = 'This notification has extra data';
    const extraData = { userId: 123, type: 'reminder' };
    const id = 202;
    
    await notificationService.scheduleNotificationWithData(title, body, extraData, id);
    
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          title,
          body,
          id,
          extra: extraData
        })
      ]
    });
  });

  it('should get pending notifications', async () => {
    const mockNotifications = [
      { id: 1, title: 'Notification 1' },
      { id: 2, title: 'Notification 2' }
    ];
    
    // Mock the return value for this specific test
    (LocalNotifications.getPending as any).mockResolvedValueOnce({
      notifications: mockNotifications
    });
    
    const result = await notificationService.getPendingNotifications();
    
    expect(LocalNotifications.getPending).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockNotifications);
  });

  it('should cancel a specific notification', async () => {
    const id = 123;
    
    await notificationService.cancelNotification(id);
    
    expect(LocalNotifications.cancel).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.cancel).toHaveBeenCalledWith({
      notifications: [{ id }]
    });
  });

  it('should cancel all notifications', async () => {
    await notificationService.cancelAllNotifications();
    
    expect(LocalNotifications.cancel).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.cancel).toHaveBeenCalledWith({
      notifications: []
    });
  });
});
