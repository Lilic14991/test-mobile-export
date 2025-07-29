import React, { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import notificationService from "../services/NotificationService";
import { getApplication } from "../config/applications";
import { getIframeUrl } from "../config/environment";

interface DynamicIFrameProps {
  appId: string;
  origin?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export interface DynamicIframeHandle {
  goBack: () => void;
}

const DynamicIframe = forwardRef<DynamicIframeHandle, DynamicIFrameProps>(
  ({ appId, origin, onError, onLoad, ...rest }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [app, setApp] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [navStack, setNavStack] = useState<string[]>([]);
    const lastUrlRef = useRef<string>("");

    // Initialize application configuration
    useEffect(() => {
      const currentApp = getApplication(appId);
      console.log(currentApp)
      if (currentApp) {
        setApp(currentApp);
        // Get the URL for the iframe
        const url = getIframeUrl();
        setNavStack([url]);
        lastUrlRef.current = url;
      } else {
        setError(new Error(`Application with id ${appId} not found`));
        if (onError) {
          onError(new Error(`Application with id ${appId} not found`));
        }
      }
    }, [appId, onError]);

    // Navigation functions
    const navigateIframe = useCallback((url: string) => {
      if (!iframeRef.current?.contentWindow) return;

      try {
        iframeRef.current.contentWindow.location.href = url;
      } catch (e) {
        console.log("Cross-origin navigation error:", e);
      }
    }, []);

    const addToNavStack = useCallback((url: string) => {
      if (lastUrlRef.current === url) return false;

      setNavStack(prev => {
        if (prev[prev.length - 1] === url) return prev;
        lastUrlRef.current = url;
        return [...prev, url];
      });

      return true;
    }, []);

    const navigateBack = useCallback(() => {
      setNavStack(prevStack => {
        if (prevStack.length > 1) {
          const newStack = prevStack.slice(0, -1);
          const previousUrl = newStack[newStack.length - 1];
          lastUrlRef.current = previousUrl;
          navigateIframe(previousUrl);
          return newStack;
        }
        return prevStack;
      });
    }, [navigateIframe]);

    // Expose goBack method via ref
    React.useImperativeHandle(ref, () => ({
      goBack: navigateBack
    }));

    // Message handling
    useEffect(() => {
      const handleMessage = async (event: MessageEvent) => {
        if (origin && event.origin !== origin) return;

        const data = event.data;
        
        // Handle URL navigation
        if (typeof data === 'string' || data?.url) {
          const url = data?.url || data;
          if (typeof url === 'string') {
            addToNavStack(url);
          }
          return;
        }

        // Handle notification requests
        if (data?.type) {
          switch (data.type) {
            case "schedule-notification":
              try {
                await notificationService.sendNotification({
                  title: data.payload?.title || "Notification",
                  body: data.payload?.body || "",
                  id: data.payload?.id,
                  delayInSeconds: data.payload?.delayInSeconds,
                  scheduledDateTime: data.payload?.scheduledDateTime 
                    ? new Date(data.payload.scheduledDateTime) 
                    : undefined,
                  repeats: data.payload?.repeats,
                  every: data.payload?.every,
                  count: data.payload?.count,
                  sound: data.payload?.sound,
                  attachments: data.payload?.attachments,
                  actions: data.payload?.actions,
                  extra: data.payload?.extra,
                });
                
                iframeRef.current?.contentWindow?.postMessage(
                  { type: 'notification-scheduled', id: data.payload?.id },
                  origin || "*"
                );
              } catch (err: any) {
                iframeRef.current?.contentWindow?.postMessage(
                  { type: "notification-error", error: err?.message || "Failed to schedule notification" },
                  origin || "*"
                );
              }
              break;

            case "cancel-notification":
              try {
                if (data.payload?.id) {
                  await notificationService.cancelNotification(data.payload.id);
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: 'notification-canceled', id: data.payload.id },
                    origin || "*"
                  );
                }
              } catch (err: any) {
                iframeRef.current?.contentWindow?.postMessage(
                  { type: "notification-error", error: err?.message || "Failed to cancel notification" },
                  origin || "*"
                );
              }
              break;

            case "get-pending-notifications":
              try {
                const pending = await notificationService.getPendingNotifications();
                iframeRef.current?.contentWindow?.postMessage(
                  { type: "pending-notifications", data: pending },
                  origin || "*"
                );
              } catch (err: any) {
                iframeRef.current?.contentWindow?.postMessage(
                  { type: "notification-error", error: err?.message || "Failed to fetch pending notifications" },
                  origin || "*"
                );
              }
              break;
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [origin, addToNavStack]);

    // Back button handling
    useEffect(() => {
      let listenerHandle: any = null;
      
      CapacitorApp.addListener("backButton", () => {
        if (navStack.length > 1) {
          navigateBack();
        } else {
          CapacitorApp.exitApp();
        }
      }).then(handle => {
        listenerHandle = handle;
      });
      
      return () => {
        if (listenerHandle) {
          listenerHandle.remove();
        }
      };
    }, [navStack, navigateBack]);

    if (!app) {
      return null;
    }

    return (
      <iframe
        ref={iframeRef}
        src={navStack[navStack.length - 1]}
        title={app.name || "Embedded Content"}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: loading ? 'none' : 'block'
        }}
        onLoad={() => {
          setLoading(false);
          if (onLoad) onLoad();
        }}
        onError={(e) => {
          const error = new Error("Failed to load iframe content");
          setError(error);
          if (onError) onError(error);
        }}
        {...rest}
      />
    );
  }
);

export default DynamicIframe;
