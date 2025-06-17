import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import DynamicIframe from "../components/DynamicIframe";
import "./Tab1.css";
import React, { useState, useEffect } from "react";
import { notificationService, notificationUtils } from "../services";
import { LocalNotifications } from "@capacitor/local-notifications";

const Tab1: React.FC = () => {
  const [pendingNotifications, setPendingNotifications] = useState<number>(0);
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");

  useEffect(() => {
    // Check permission status and update pending notifications count
    const checkStatus = async () => {
      const status = await notificationService.checkPermissions();
      setPermissionStatus(status.display);
    };
    
    checkStatus();
    updatePendingCount();
    
    // Set up listeners for notification events
    let receivedListener: any = null;
    let actionListener: any = null;
    
    const setupListeners = async () => {
      receivedListener = await LocalNotifications.addListener(
        'localNotificationReceived', 
        () => {
          // Update the count when a notification is received
          updatePendingCount();
        }
      );
      
      actionListener = await LocalNotifications.addListener(
        'localNotificationActionPerformed', 
        () => {
          // Update the count when a notification action is performed
          updatePendingCount();
        }
      );
    };
    
    setupListeners();
    
    // Clean up listeners when component unmounts, check it on mobile
    return () => {
      if (receivedListener) receivedListener.remove();
      if (actionListener) actionListener.remove();
    };
  }, []);

  const updatePendingCount = async () => {
    const notifications = await notificationService.getPendingNotifications();
    setPendingNotifications(notifications.length);
  };

  const sendBasicNotification = async () => {
    await notificationService.scheduleNotification(
      "Basic Notification",
      "This is a simple notification from your Ionic app!",
      Math.floor(Math.random() * 10000),
      2 // Show after 2 seconds
    );
    updatePendingCount();
  };

  const sendScheduledNotification = async () => {
    // Schedule a notification for 1 minute from now
    const scheduledTime = new Date(Date.now() + 60000);
    await notificationService.scheduleNotificationAt(
      "Scheduled Notification",
      `This notification was scheduled for ${scheduledTime.toLocaleTimeString()}`,
      scheduledTime
    );
    updatePendingCount();
  };

  const sendRepeatingNotification = async () => {
    await notificationService.scheduleRepeatingNotification(
      "Repeating Notification",
      "This notification will repeat every hour",
      3600 // 1 hour in seconds
    );
    updatePendingCount();
  };

  const sendNotificationWithActions = async () => {
    await notificationService.scheduleNotificationWithActions(
      "Action Notification",
      "This notification has custom action buttons",
      [
        { id: "reply", title: "Reply" },
        { id: "dismiss", title: "Dismiss" }
      ]
    );
    updatePendingCount();
  };

  const sendNotificationWithData = async () => {
    await notificationService.scheduleNotificationWithData(
      "Data Notification",
      "This notification contains extra data",
      { userId: 123, type: "reminder", priority: "high" }
    );
    updatePendingCount();
  };

  const cancelAllNotifications = async () => {
    await notificationService.cancelAllNotifications();
    updatePendingCount();
  };
  
  const requestPermissions = async () => {
    const status = await notificationService.requestPermissions();
    setPermissionStatus(status.display);
  };
  
  // Advanced notification examples using utility functions
  const scheduleForTonight = async () => {
    // Schedule a notification for 8:00 PM tonight
    await notificationUtils.scheduleForTimeOfDay(
      "Evening Reminder",
      "Don't forget to check your app before bed!",
      20, // 8 PM
      0   // 0 minutes
    );
    updatePendingCount();
  };
  
  const scheduleForWeekend = async () => {
    // Schedule a notification for Saturday at 10:00 AM
    await notificationUtils.scheduleForDayOfWeek(
      "Weekend Plans",
      "Have you made plans for the weekend yet?",
      6, // Saturday (0 = Sunday, 6 = Saturday)
      10, // 10 AM
      0   // 0 minutes
    );
    updatePendingCount();
  };
  
  const startCountdown = async () => {
    // Start a 5-second countdown with notifications
    await notificationUtils.scheduleCountdown(
      "Countdown",
      "Time's up! Your countdown is complete.",
      5,    // Count from 5
      1,    // 1 second interval
      20000 // Base ID
    );
    updatePendingCount();
  };
  
  const scheduleWithSnooze = async () => {
    // Schedule a notification with a snooze option
    await notificationUtils.scheduleWithSnooze(
      "Important Reminder",
      "This is an important reminder that you can snooze if needed.",
      5 // Snooze for 5 minutes
    );
    updatePendingCount();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div style={{ padding: "16px" }}>
          <h2>Capacitor Local Notifications Demo</h2>
          
          <div style={{ 
            padding: "10px", 
            marginBottom: "15px", 
            backgroundColor: "#f8f8f8", 
            borderRadius: "8px",
            border: "1px solid #ddd" 
          }}>
            <h3 style={{ margin: "0 0 10px 0" }}>Status</h3>
            <p style={{ margin: "5px 0" }}>
              <strong>Permission:</strong> {permissionStatus}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Pending notifications:</strong> {pendingNotifications}
            </p>
            <IonButton 
              size="small" 
              fill="outline" 
              onClick={requestPermissions}
              style={{ marginTop: "10px" }}
            >
              Request Permissions
            </IonButton>
          </div>
          
          <IonList>
            <IonItem>
              <IonLabel>Basic Notifications</IonLabel>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={sendBasicNotification}>
                Send Basic Notification
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={sendScheduledNotification}>
                Schedule Notification (1 min)
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={sendRepeatingNotification}>
                Send Repeating Notification
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={sendNotificationWithActions}>
                Send Notification with Actions
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={sendNotificationWithData}>
                Send Notification with Data
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonLabel>Advanced Notifications</IonLabel>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={scheduleForTonight}>
                Schedule for Tonight (8 PM)
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={scheduleForWeekend}>
                Schedule for Weekend
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={startCountdown}>
                Start 5-Second Countdown
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" onClick={scheduleWithSnooze}>
                Notification with Snooze
              </IonButton>
            </IonItem>
            
            <IonItem>
              <IonButton expand="block" color="danger" onClick={cancelAllNotifications}>
                Cancel All Notifications
              </IonButton>
            </IonItem>
          </IonList>
          
          <div style={{ marginTop: "20px" }}>
            <h3>Notes:</h3>
            <ul>
              <li>Basic notifications appear immediately or after a short delay</li>
              <li>Scheduled notifications appear at a specific date/time</li>
              <li>Repeating notifications will continue to appear at regular intervals</li>
              <li>Action notifications include buttons the user can tap</li>
              <li>Data notifications contain extra information that can be used by the app</li>
            </ul>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
