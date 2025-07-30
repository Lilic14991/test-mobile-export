import React, { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import notificationService from "../services/NotificationService";
import { 
  getApplication, 
  getIframeUrl, 
  getSandboxAttributes, 
  getPermissionsPolicy,
  Application
} from "../config/applications";

/**
 * Props for the DynamicIframe component
 */
interface DynamicIFrameProps {
  /** ID of the application to load in the iframe */
  appId: string;
  /** Origin for postMessage communication (for security) */
  origin?: string;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when the iframe content loads successfully */
  onLoad?: () => void;
}

/**
 * Methods exposed via the ref handle
 */
export interface DynamicIframeHandle {
  /** Navigate back in the iframe's history */
  goBack: () => void;
}

/**
 * Message types that can be received from the iframe
 */
type IframeMessage = 
  | string 
  | { url: string }
  | { 
      type: 'schedule-notification' | 'cancel-notification' | 'get-pending-notifications',
      payload?: any 
    };

/**
 * Type guard to check if the message is a notification request
 */
const isNotificationRequest = (data: any): data is { 
  type: 'schedule-notification' | 'cancel-notification' | 'get-pending-notifications',
  payload?: any 
} => {
  return data && typeof data === 'object' && 
    (data.type === 'schedule-notification' || 
     data.type === 'cancel-notification' || 
     data.type === 'get-pending-notifications');
};

/**
 * Type guard to check if the message is a URL navigation request
 */
const isUrlNavigation = (data: any): data is string | { url: string } => {
  return typeof data === 'string' || (typeof data === 'object' && 'url' in data);
};

/**
 * DynamicIframe Component
 * 
 * A component that renders an iframe with enhanced capabilities:
 * - Navigation history tracking
 * - Back button support
 * - Communication with the iframe content
 * - Notification handling
 * - Security controls via sandbox and permissions
 * 
 * @param props Component props
 * @param ref Ref to access the component's methods
 */
const DynamicIframe = forwardRef<DynamicIframeHandle, DynamicIFrameProps>(
  ({ appId, origin, onError, onLoad, ...rest }, ref) => {
    // Refs
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const lastUrlRef = useRef<string>("");
    
    // State
    const [app, setApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [navStack, setNavStack] = useState<string[]>([]);

    // Initialize application configuration
    useEffect(() => {
      try {
        const currentApp = getApplication(appId);
        if (!currentApp) {
          const appNotFoundError = new Error(`Application with id ${appId} not found`);
          setError(appNotFoundError);
          if (onError) {
            onError(appNotFoundError);
          }
          return;
        }
        
        setApp(currentApp);
        
        // Get the URL for the iframe based on the application configuration
        const url = getIframeUrl(currentApp);
        
        // Log the URL for debugging
        console.log(`[DynamicIframe] URL for ${currentApp.name}: ${url}`);
        
        setNavStack([url]);
        lastUrlRef.current = url;
        
        console.log(`[DynamicIframe] Initialized app: ${currentApp.name} (${appId})`);
      } catch (err) {
        const initError = err instanceof Error ? err : new Error(`Failed to initialize iframe: ${err}`);
        console.error("[DynamicIframe] Initialization error:", initError);
        setError(initError);
        if (onError) {
          onError(initError);
        }
      }
    }, [appId, onError]);

    // Navigation functions
    const navigateIframe = useCallback((url: string) => {
      if (!iframeRef.current?.contentWindow) {
        console.warn("[DynamicIframe] Cannot navigate: contentWindow is not available");
        return;
      }

      try {
        iframeRef.current.contentWindow.location.href = url;
        console.log(`[DynamicIframe] Navigated to: ${url}`);
      } catch (e) {
        console.error("[DynamicIframe] Cross-origin navigation error:", e);
      }
    }, []);

    const addToNavStack = useCallback((url: string) => {
      // Avoid duplicate entries
      if (lastUrlRef.current === url) return false;

      setNavStack(prev => {
        // Double-check to avoid race conditions
        if (prev[prev.length - 1] === url) return prev;
        
        // Update the last URL reference and add to stack
        lastUrlRef.current = url;
        const newStack = [...prev, url];
        console.log(`[DynamicIframe] Added to navigation stack: ${url} (stack size: ${newStack.length})`);
        return newStack;
      });

      return true;
    }, []);

    const navigateBack = useCallback(() => {
      setNavStack(prevStack => {
        if (prevStack.length <= 1) {
          console.log("[DynamicIframe] Cannot go back: at the first page");
          return prevStack;
        }
        
        // Remove the current URL and navigate to the previous one
        const newStack = prevStack.slice(0, -1);
        const previousUrl = newStack[newStack.length - 1];
        lastUrlRef.current = previousUrl;
        navigateIframe(previousUrl);
        
        console.log(`[DynamicIframe] Navigated back to: ${previousUrl}`);
        return newStack;
      });
    }, [navigateIframe]);

    // Expose goBack method via ref
    React.useImperativeHandle(ref, () => ({
      goBack: navigateBack
    }));

    /**
     * Post a message to the iframe content window
     */
    const postMessageToIframe = useCallback((message: any) => {
      if (!iframeRef.current?.contentWindow) {
        console.warn("[DynamicIframe] Cannot post message: contentWindow is not available");
        return false;
      }
      
      try {
        iframeRef.current.contentWindow.postMessage(message, origin || "*");
        return true;
      } catch (err) {
        console.error("[DynamicIframe] Error posting message to iframe:", err);
        return false;
      }
    }, [origin]);
    
    /**
     * Handle notification-related requests from the iframe
     */
    const handleNotificationRequest = useCallback(async (data: any) => {
      if (!isNotificationRequest(data)) return;
      
      switch (data.type) {
        case "schedule-notification":
          try {
            const payload = data.payload || {};
            await notificationService.sendNotification({
              title: payload.title || "Notification",
              body: payload.body || "",
              id: payload.id,
              delayInSeconds: payload.delayInSeconds,
              scheduledDateTime: payload.scheduledDateTime 
                ? new Date(payload.scheduledDateTime) 
                : undefined,
              repeats: payload.repeats,
              every: payload.every,
              count: payload.count,
              sound: payload.sound,
              attachments: payload.attachments,
              actions: payload.actions,
              extra: payload.extra,
            });
            
            postMessageToIframe({ 
              type: 'notification-scheduled', 
              id: payload.id 
            });
            
            console.log(`[DynamicIframe] Scheduled notification with ID: ${payload.id}`);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to schedule notification";
            postMessageToIframe({ 
              type: "notification-error", 
              error: errorMessage 
            });
            console.error("[DynamicIframe] Notification scheduling error:", err);
          }
          break;

        case "cancel-notification":
          try {
            const id = data.payload?.id;
            if (id !== undefined) {
              await notificationService.cancelNotification(id);
              postMessageToIframe({ 
                type: 'notification-canceled', 
                id 
              });
              console.log(`[DynamicIframe] Canceled notification with ID: ${id}`);
            } else {
              throw new Error("No notification ID provided");
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to cancel notification";
            postMessageToIframe({ 
              type: "notification-error", 
              error: errorMessage 
            });
            console.error("[DynamicIframe] Notification cancellation error:", err);
          }
          break;

        case "get-pending-notifications":
          try {
            const pending = await notificationService.getPendingNotifications();
            postMessageToIframe({ 
              type: "pending-notifications", 
              data: pending 
            });
            console.log(`[DynamicIframe] Retrieved ${pending.length} pending notifications`);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch pending notifications";
            postMessageToIframe({ 
              type: "notification-error", 
              error: errorMessage 
            });
            console.error("[DynamicIframe] Error getting pending notifications:", err);
          }
          break;
      }
    }, [postMessageToIframe]);

    // Message handling
    useEffect(() => {
      const handleMessage = async (event: MessageEvent) => {
        // Security check: validate origin if specified
        if (origin && event.origin !== origin) {
          console.warn(`[DynamicIframe] Ignored message from unauthorized origin: ${event.origin}`);
          return;
        }

        const data = event.data;
        
        // Handle URL navigation
        if (isUrlNavigation(data)) {
          const url = typeof data === 'string' ? data : data.url;
          if (typeof url === 'string') {
            addToNavStack(url);
            console.log(`[DynamicIframe] Navigation request received: ${url}`);
          }
          return;
        }

        // Handle notification requests
        if (isNotificationRequest(data)) {
          await handleNotificationRequest(data);
        }
      };

      window.addEventListener('message', handleMessage);
      console.log("[DynamicIframe] Message event listener registered");
      
      return () => {
        window.removeEventListener('message', handleMessage);
        console.log("[DynamicIframe] Message event listener removed");
      };
    }, [origin, addToNavStack, handleNotificationRequest]);

    // Back button handling for native platforms
    useEffect(() => {
      let listenerHandle: any = null;
      
      const setupBackButtonHandler = async () => {
        try {
          const handle = await CapacitorApp.addListener("backButton", () => {
            if (navStack.length > 1) {
              // If we have navigation history, go back
              navigateBack();
              console.log("[DynamicIframe] Back button pressed: navigating back");
            } else {
              // Otherwise exit the app
              CapacitorApp.exitApp();
              console.log("[DynamicIframe] Back button pressed: exiting app");
            }
          });
          
          listenerHandle = handle;
          console.log("[DynamicIframe] Back button handler registered");
        } catch (err) {
          console.error("[DynamicIframe] Failed to register back button handler:", err);
        }
      };
      
      setupBackButtonHandler();
      
      return () => {
        if (listenerHandle) {
          listenerHandle.remove();
          console.log("[DynamicIframe] Back button handler removed");
        }
      };
    }, [navStack, navigateBack]);

    // Don't render anything if the app configuration is not available
    if (!app) {
      return null;
    }

    // Get security attributes
    const sandboxAttributes = getSandboxAttributes(app);
    const permissionsPolicy = getPermissionsPolicy(app);
    
    // Apply custom styles from app configuration
    const iframeStyles = {
      width: app.styles?.width || '100%',
      height: app.styles?.height || '100%',
      border: app.styles?.border || 'none',
      borderRadius: app.styles?.borderRadius || '0',
      display: loading ? 'none' : 'block',
      backgroundColor: '#ffffff' // Add background color for visibility
    };

    // Get the current URL from the navigation stack
    const currentUrl = navStack.length > 0 ? navStack[navStack.length - 1] : '';

    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid #ddd', // Add border for debugging
        position: 'relative'
      }}>
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
            Loading {app.name}...
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={currentUrl}
          title={app.name || "Embedded Content"}
          style={iframeStyles}
          sandbox={sandboxAttributes}
          allow={permissionsPolicy}
          onLoad={() => {
            setLoading(false);
            console.log(`[DynamicIframe] Content loaded: ${app.name}`);
            if (onLoad) onLoad();
          }}
          onError={(e) => {
            const loadError = new Error(`Failed to load iframe content for ${app.name}`);
            setError(loadError);
            console.error("[DynamicIframe] Load error:", e);
            if (onError) onError(loadError);
          }}
          {...rest}
        />
        
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            marginTop: '10px',
            borderRadius: '4px'
          }}>
            Error: {error.message}
          </div>
        )}
      </div>
    );
  }
);

export default DynamicIframe;
