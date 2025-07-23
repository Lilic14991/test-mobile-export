import React, { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import notificationService from "../services/NotificationService";
import { Application, getApplication, getSandboxAttributes, getPermissionsPolicy, getIframeUrl } from "../config/applications";

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
    const [app, setApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [navStack, setNavStack] = useState<string[]>([]);
    const lastUrlRef = useRef<string>("");
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Initialize application configuration
    useEffect(() => {
      const currentApp = getApplication(appId);
      if (currentApp) {
        setApp(currentApp);
        const url = getIframeUrl(currentApp);
        setNavStack([url]);
        lastUrlRef.current = url;
      } else {
        setError(new Error(`Application with id ${appId} not found`));
      }
    }, [appId]);

    // Setup lazy loading
    useEffect(() => {
      if (!app || app.loading.type === 'eager') return;

      const options = {
        threshold: app.loading.threshold || 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setLoading(false);
            observer.disconnect();
          }
        });
      }, options);

      if (iframeRef.current) {
        observer.observe(iframeRef.current);
      }

      observerRef.current = observer;
      return () => observer.disconnect();
    }, [app]);

    // Error handling and retry logic
    useEffect(() => {
      if (!error || !app) return;

      if (retryCount < app.errorHandling.retryAttempts) {
        const timer = setTimeout(() => {
          setError(null);
          setRetryCount(prev => prev + 1);
          setLoading(true);
        }, app.errorHandling.retryDelay);

        return () => clearTimeout(timer);
      } else if (app.errorHandling.fallbackUrl) {
        const url = app.errorHandling.fallbackUrl;
        setNavStack([url]);
        lastUrlRef.current = url;
      }
    }, [error, retryCount, app]);

    // Navigation functions
    const navigateIframe = useCallback((url: string) => {
      if (!iframeRef.current?.contentWindow) return;

      iframeRef.current.contentWindow.postMessage({ goto: url }, origin || "*");

      try {
        iframeRef.current.contentWindow.location.href = url;
      } catch (e) {
        console.log("Cross-origin navigation handled via postMessage");
      }
    }, [origin]);

    const addToNavStack = useCallback((url: string) => {
      if (lastUrlRef.current === url) return false;

      let added = false;
      setNavStack(prev => {
        if (prev[prev.length - 1] === url) return prev;

        const existingIndex = prev.indexOf(url);
        if (existingIndex >= 0 && existingIndex < prev.length - 1) {
          const newStack = [...prev.slice(0, existingIndex), ...prev.slice(existingIndex + 1)];
          added = true;
          lastUrlRef.current = url;
          return [...newStack, url];
        }

        added = true;
        lastUrlRef.current = url;
        return [...prev, url];
      });

      return added;
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
        const url = data?.url || (typeof data === 'string' ? data : null);
        
        if (typeof url === "string") {
          addToNavStack(url);
          return;
        }

        switch (data?.type) {
          case "schedule-notification":
            try {
              await notificationService.sendNotification({
                title: data.payload.title || "No Title",
                body: data.payload.body || "No Body",
                id: data.payload.id,
                delayInSeconds: Math.floor((data.payload.delayMs || 1000) / 1000),
                scheduledDateTime: data.payload.scheduledDateTime
                  ? new Date(data.payload.scheduledDateTime)
                  : undefined,
                repeats: data.payload.repeats,
                every: data.payload.every,
                count: data.payload.count,
                sound: data.payload.sound,
                attachments: data.payload.attachments,
                actions: data.payload.actions,
                extra: data.payload.extra,
              });
              iframeRef.current?.contentWindow?.postMessage(
                { type: 'notification-scheduled', id: data.payload.id },
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
              await notificationService.cancelNotification(data.payload.id);
              iframeRef.current?.contentWindow?.postMessage(
                { type: 'notification-canceled', id: data.payload.id },
                origin || "*"
              );
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

    // Loading timeout
    useEffect(() => {
      if (!app || !loading) return;

      const timeoutId = setTimeout(() => {
        setError(new Error("Loading timeout exceeded"));
      }, app.errorHandling.timeoutDuration);

      return () => clearTimeout(timeoutId);
    }, [app, loading]);

    if (!app) {
      return null;
    }

    const shouldRender = app.loading.type === 'eager' || !loading;

    return shouldRender ? (
      <iframe
        ref={iframeRef}
        src={navStack[navStack.length - 1]}
        title={app.name}
        sandbox={getSandboxAttributes(app)}
        allow={getPermissionsPolicy(app)}
        style={{
          ...app.styles,
          display: loading ? 'none' : 'block'
        }}
        onLoad={() => {
          setLoading(false);
          onLoad?.();
        }}
        onError={(e) => {
          const error = new Error("Failed to load iframe content");
          setError(error);
          onError?.(error);
        }}
        {...rest}
      />
    ) : null;
  }
);

export default DynamicIframe;
