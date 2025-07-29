import React, { useRef, useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonToast,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle
} from '@ionic/react';
import { arrowBack, refreshOutline } from 'ionicons/icons';
import DynamicIframe, { DynamicIframeHandle } from '../components/DynamicIframe';
import { applications, Application } from '../config/applications';

const IframeTest: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('client-web');
  const [selectedApp, setSelectedApp] = useState<Application | undefined>(
    applications.find(app => app.id === 'client-web')
  );
  
  // Create a ref to the iframe component
  const iframeRef = useRef<DynamicIframeHandle>(null);
  
  // Update selected app when app ID changes
  useEffect(() => {
    const app = applications.find(app => app.id === selectedAppId);
    setSelectedApp(app);
  }, [selectedAppId]);
  
  // Function to handle back button click
  const handleBackClick = () => {
    if (iframeRef.current) {
      iframeRef.current.goBack();
    }
  };

  // Function to handle app selection change
  const handleAppChange = (event: CustomEvent) => {
    setSelectedAppId(event.detail.value);
  };
  
  const handleError = (error: Error) => {
    setToastMessage(`Error: ${error.message}`);
    setShowToast(true);
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Multi-App Viewer</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => window.location.reload()}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Multi-App Viewer</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Application Selection</IonCardTitle>
            <IonCardSubtitle>Choose an application to display</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>Select Application</IonLabel>
                <IonSelect 
                  value={selectedAppId} 
                  onIonChange={handleAppChange}
                  interface="popover"
                >
                  {applications.map(app => (
                    <IonSelectOption key={app.id} value={app.id}>
                      {app.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              
              {selectedApp && (
                <IonItem lines="none">
                  <IonLabel>
                    <h2>{selectedApp.name}</h2>
                    <p>{selectedApp.description}</p>
                    <p><small>Version: {selectedApp.version}</small></p>
                  </IonLabel>
                </IonItem>
              )}
            </IonList>
          </IonCardContent>
        </IonCard>
        
        <div style={{ 
          width: '100%', 
          height: 'calc(100vh - 220px)',
          padding: '0 16px 16px 16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedApp && (
            <DynamicIframe
              ref={iframeRef}
              appId={selectedAppId}
              onError={handleError}
              onLoad={() => console.log(`${selectedApp.name} loaded successfully`)}
            />
          )}
        </div>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={5000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default IframeTest;
