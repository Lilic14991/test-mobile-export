import React, { useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonToast } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import DynamicIframe, { DynamicIframeHandle } from '../components/DynamicIframe';

const IframeTest: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Create a ref to the iframe component
  const iframeRef = useRef<DynamicIframeHandle>(null);
  
  // Function to handle back button click
  const handleBackClick = () => {
    console.log('Back button clicked');
    if (iframeRef.current) {
      iframeRef.current.goBack();
    }
  };

  // Use a default app ID
  const appId = 'client-web';
  
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
          <IonTitle>Iframe Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Iframe Test</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div style={{ width: '100%', height: 'calc(100vh - 56px)' }}>
          <DynamicIframe
            ref={iframeRef}
            appId={appId}
            onError={handleError}
            onLoad={() => console.log('Iframe loaded successfully')}
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
    </IonPage>
  );
};

export default IframeTest;
