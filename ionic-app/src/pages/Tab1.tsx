import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
import DynamicIframe from "../components/DynamicIframe";
import "./Tab1.css";
import { LocalNotifications } from "@capacitor/local-notifications";
import React from "react";

const Tab1: React.FC = () => {
  React.useEffect(() => {
    LocalNotifications.requestPermissions();
  }, []);

  const sendTestNotification = async () => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Test Notification",
          body: "This is a test notification from your Ionic app!",
          id: 1,
          schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
        },
      ],
    });
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
        <button
          style={{
            margin: "16px",
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            background: "#3880ff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
          onClick={sendTestNotification}
        >
          Send Test Notification
        </button>
        <div className="iframe-position">
          <DynamicIframe
            width={858}
            height={487}
            src="https://www.youtube.com/embed/UIQjL4WkF-4"
            title="Miyamoto Musashi Meditation: Enter Flow State For 1 Hour"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
