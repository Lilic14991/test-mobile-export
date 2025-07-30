import React, { useRef, useState } from 'react';
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
  IonFooter
} from '@ionic/react';
import { arrowBack, refreshOutline, informationCircleOutline } from 'ionicons/icons';
import DynamicIframe, { DynamicIframeHandle } from '../components/DynamicIframe';
import { getApplication } from '../config/applications';

const PumpClickerApp: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Create a ref to the iframe component
  const iframeRef = useRef<DynamicIframeHandle>(null);
  
  // Function to handle back button click
  const handleBackClick = () => {
    if (iframeRef.current) {
      iframeRef.current.goBack();
    }
  };
  
  const handleError = (error: Error) => {
    console.error("PumpClickerApp error:", error);
    setToastMessage(`Error: ${error.message}`);
    setShowToast(true);
  };
  
  const handleLoad = () => {
    console.log("Pump Clicker loaded successfully");
    setLoading(false);
    setToastMessage("Pump Clicker loaded successfully");
    setShowToast(true);
  };
  
  // Get app info for debugging
  const app = getApplication('pump-clicker');
  const appInfo = app ? 
    `App: ${app.name} (${app.id}), URLs: ${app.devUrl} / ${app.prodUrl}` : 
    'App not found';
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Pump Clicker</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => window.location.reload()}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
            <IonButton onClick={() => {
              setToastMessage(appInfo);
              setShowToast(true);
            }}>
              <IonIcon icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            zIndex: 10
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h2>Loading Pump Clicker...</h2>
              <p>Please wait while the game loads</p>
            </div>
          </div>
        )}
        
        <div style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <DynamicIframe
            ref={iframeRef}
            appId="pump-clicker"
            onError={handleError}
            onLoad={handleLoad}
          />
        </div>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={5000}
          position="bottom"
        />
      </IonContent>
      
      <IonFooter>
        <IonToolbar>
          <div style={{ 
            padding: '5px 15px', 
            fontSize: '12px', 
            textAlign: 'center',
            color: '#666'
          }}>
            Pump Clicker Game - Embedded Version
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default PumpClickerApp;
