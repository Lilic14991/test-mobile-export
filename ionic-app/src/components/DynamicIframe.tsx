import React, { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { App as CapacitorApp } from "@capacitor/app";

type DynamicIFrameProps = {
  initialUrl: string;
  origin?: string; 
  width?: number | string;
  height?: number | string;
  title?: string;
  [key: string]: any;
};

export type DynamicIframeHandle = {
  goBack: () => void;
};

const DynamicIframe = forwardRef<DynamicIframeHandle, DynamicIFrameProps>(
  ({ width = "100%", height = "100%", title, initialUrl, origin, ...rest }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [navStack, setNavStack] = useState<string[]>([initialUrl]);
    
    // Keep track of the last URL to avoid duplicates
    const lastUrlRef = useRef<string>(initialUrl);
    
    // Log when navStack changes
    useEffect(() => {
      setNavStack(navStack);
      console.log("Navigation stack updated:", navStack);
    }, [navStack]);
    
    // Function to navigate the iframe without reloading
    const navigateIframe = useCallback((url: string) => {
      console.log("Navigating iframe to:", url);
      
      if (!iframeRef.current || !iframeRef.current.contentWindow) {
        return;
      }
      
      // For cross-origin iframes, we should prioritize postMessage
      // Try postMessage first as it works across origins
      iframeRef.current.contentWindow.postMessage({ goto: url }, "*");
      
      // As a fallback, try direct navigation if possible (will likely fail for cross-origin)
      try {
        // This will throw an error for cross-origin iframes
        iframeRef.current.contentWindow.location.href = url;
      } catch (e) {
        console.log("Cannot access contentWindow location due to security restrictions (expected for cross-origin)");
        // This is expected for cross-origin iframes, postMessage is already sent above
      }
    }, []);
    
    // Add URL to navigation stack without duplicates
    const addToNavStack = useCallback((url: string) => {
      // Don't add if it's the same as the last URL
      if (lastUrlRef.current === url) {
        return false;
      }
      
      let added = false;
      
      setNavStack(prev => {
        // Check if this URL is already the last one in the stack
        if (prev.length > 0 && prev[prev.length - 1] === url) {
          return prev;
        }
        
        // Check if this URL is already in the stack somewhere else
        const existingIndex = prev.indexOf(url);
        if (existingIndex >= 0 && existingIndex < prev.length - 1) {
          // URL exists in the stack but not at the top
          // Remove it from its current position to avoid duplicates
          console.log("URL exists in stack, moving to top:", url);
          const newStack = [...prev.slice(0, existingIndex), ...prev.slice(existingIndex + 1)];
          added = true;
          lastUrlRef.current = url;
          return [...newStack, url];
        }
        
        // URL is not in the stack, add it
        console.log("Adding new URL to navigation stack:", url);
        added = true;
        lastUrlRef.current = url;
        return [...prev, url];
      });
      
      return added;
    }, []);
    
    // Extract navigation logic to a reusable function
    const navigateBack = useCallback(() => {
      console.log("navigateBack called");
      
      setNavStack(prevStack => {
        if (prevStack.length > 1) {
          // Remove the current URL from the stack and navigate to the previous one
          const newStack = prevStack.slice(0, -1);
          const previousUrl = newStack[newStack.length - 1];
          console.log("Navigating back to:", previousUrl);
          
          // Update last URL reference
          lastUrlRef.current = previousUrl;
          
          // Navigate the iframe to the previous URL
          navigateIframe(previousUrl);
          
          // Return the new stack without the current URL
          return newStack;
        }
        
        console.log("Cannot navigate back - at the beginning of stack");
        return prevStack;
      });
    }, [navigateIframe]);

    // Implement the goBack method and expose it via ref
    React.useImperativeHandle(ref, () => ({
      goBack: navigateBack
    }));

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        // Check origin if specified
        if (origin && event.origin !== origin) {
          return;
        }
        
        // Handle different message formats
        const url = event.data?.url || (typeof event.data === 'string' ? event.data : null);
        if (typeof url === "string") {
          
          // Add to navigation stack if it's a new URL
          addToNavStack(url);
          
          // No need to navigate the iframe here since the message came from the iframe itself
          // indicating it has already navigated
        } else {
          console.log("Received message with no valid URL:", event.data);
        }
      };

      window.addEventListener('message', handleMessage);
      // Removing message event listener
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [origin, addToNavStack]);

    useEffect(() => {
      // Create a variable to hold the listener handle
      let listenerHandle: any = null;
      
      // Add the listener and store the handle when the Promise resolves
      CapacitorApp.addListener("backButton", () => {
        console.log("Back button pressed, navStack length:", navStack.length);
        // If we can navigate back, do so, otherwise exit the app
        if (navStack.length > 1) {
          console.log("Navigating back within the app");
          navigateBack();
        } else {
          console.log("Exiting app - at the beginning of navigation stack");
          CapacitorApp.exitApp();
        }
      }).then(handle => {
        listenerHandle = handle;
      });
      
      // Cleanup function to remove the listener
      return () => {
        if (listenerHandle) {
          console.log("Removing backButton event listener");
          listenerHandle.remove();
        }
      };
    }, [navStack, navigateBack]);

    // Handle iframe navigation events - removed direct access to contentWindow.location.href
    // which causes cross-origin security errors
    const handleIframeNavigation = useCallback(() => {
      // We no longer try to access iframe.contentWindow.location.href directly
      // Instead, we rely on postMessage communication from the iframe
      console.log("Iframe navigation handled via postMessage API");
    }, []);
    
    // Function to handle link clicks inside the iframe
    // Note: This function may not work with cross-origin iframes due to security restrictions
    // But we keep it as a fallback for same-origin scenarios
    const setupIframeLinkInterception = useCallback(() => {
      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) return;
        
        console.log("Attempting to set up link interception in iframe");
        
        // This will likely fail for cross-origin iframes, but we try anyway
        // The iframe should use postMessage API to communicate navigation events
        try {
          if (iframe.contentDocument) {
            console.log("Setting up link interception in iframe");
            
            // Try to add a script to the iframe to intercept link clicks
            const script = iframe.contentDocument.createElement('script');
            script.textContent = `
              // Intercept all link clicks
              document.addEventListener('click', function(e) {
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                  const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
                  const href = link.getAttribute('href');
                  if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    e.preventDefault();
                    console.log('Link clicked:', href);
                    window.parent.postMessage({ url: href }, '*');
                  }
                }
              });
            `;
            
            iframe.contentDocument.head.appendChild(script);
          }
        } catch (e) {
          console.log("Could not access contentDocument due to security restrictions");
        }
      } catch (e) {
        console.log("Could not set up link interception due to security restrictions:", e);
      }
    }, []);

    // Initial load of the iframe
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    
    return (
      <iframe
        ref={iframeRef}
        width={width}
        height={height}
        src={isFirstLoad ? initialUrl : undefined}
        title={title}
        onLoad={() => {
          console.log("Iframe loaded with URL:", navStack[navStack.length -1]);
          
          if (isFirstLoad) {
            setIsFirstLoad(false);
          }
          
          // Try to detect navigation within the iframe
          setTimeout(handleIframeNavigation, 100);
          
          // Try to set up link interception
          setTimeout(setupIframeLinkInterception, 500);
        }}
        {...rest}
      />
    );
  }
);

export default DynamicIframe;
