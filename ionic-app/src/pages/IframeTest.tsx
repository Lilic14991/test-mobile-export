import React, { useRef, useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonToast } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import DynamicIframe, { DynamicIframeHandle } from '../components/DynamicIframe';
import { getIframeUrl } from '../config/environment';

const IframeTest: React.FC = () => {
  // State to store the iframe URL
  const [baseUrl, setBaseUrl] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Function to try different URLs for Android
  // const tryDifferentUrls = () => {
  //   // Array of possible URLs to try
  //   const urlsToTry = [
  //     { url: 'http://localhost:3001/', description: 'Localhost' },
  //     { url: 'http://10.0.2.2:3001/', description: 'Default Android Emulator Host' },
  //     // Add your development machine's actual IP here
  //     { url: 'http://192.168.1.107:3001/', description: 'Development Machine IP' },
  //   ];
    
  //   // Get the current URL index from localStorage or start with 0
  //   const storedIndex = typeof window !== 'undefined' ? localStorage.getItem('urlIndex') : null;
  //   const currentIndex = storedIndex ? parseInt(storedIndex, 10) : 0;
    
  //   // Get the URL to try
  //   const urlData = urlsToTry[currentIndex % urlsToTry.length];
  //   console.log(urlData, "url data")
    
  //   // Set the URL
  //   setBaseUrl(urlData.url);
  //   setToastMessage(`Trying URL ${currentIndex + 1}/${urlsToTry.length}: ${urlData.description} - ${urlData.url}`);
  //   setShowToast(true);
    
  //   // Store the next index for next time
  //   localStorage.setItem('urlIndex', ((currentIndex + 1) % urlsToTry.length).toString());
  // };

  // Button to try a different URL
  // const tryNextUrl = () => {
  //   tryDifferentUrls();
  // };

  // Determine the correct URL based on platform
  const iframeUrl: string = getIframeUrl(baseUrl);
  
  // Create a ref to the iframe component
  const iframeRef = useRef<DynamicIframeHandle>(null);
  
  // Function to handle back button click
  const handleBackClick = () => {
    console.log('Back button clicked');
    if (iframeRef.current) {
      iframeRef.current.goBack();
    }
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
          <IonButtons slot="end">
            {/* <IonButton onClick={tryNextUrl}>
              Try Next URL
            </IonButton> */}
          </IonButtons>
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
            initialUrl={baseUrl}
            src={iframeUrl}
            width="100%"
            height="100%"
            title="Test Iframe"
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
