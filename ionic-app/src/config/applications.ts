/**
 * Interface for iframe sandbox options
 * Controls what features are available to the iframe content
 */
export interface IframeSandboxOptions {
  /** Allow form submission */
  allowForms?: boolean;
  /** Allow opening popup windows */
  allowPopups?: boolean;
  /** Allow JavaScript execution */
  allowScripts?: boolean;
  /** Allow same origin requests */
  allowSameOrigin?: boolean;
  /** Allow navigation of the top-level browsing context */
  allowTopNavigation?: boolean;
}

/**
 * Interface for iframe permissions policy
 * Controls access to browser features
 */
export interface IframePermissionsPolicy {
  /** Allow camera access */
  camera?: boolean;
  /** Allow microphone access */
  microphone?: boolean;
  /** Allow geolocation access */
  geolocation?: boolean;
  /** Allow fullscreen mode */
  fullscreen?: boolean;
  /** Allow payment API access */
  payment?: boolean;
}

/**
 * Interface for iframe loading strategy
 * Controls how and when iframes are loaded
 */
export interface LoadingStrategy {
  /** Loading type: eager (immediate) or lazy (deferred) */
  type: 'eager' | 'lazy';
  /** Intersection observer threshold for lazy loading (0.0 to 1.0) */
  threshold?: number;
}

/**
 * Interface for error handling configuration
 * Controls how errors are handled when loading iframe content
 */
export interface ErrorHandling {
  /** URL to display if the iframe fails to load */
  fallbackUrl?: string;
  /** Number of retry attempts before giving up */
  retryAttempts: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay: number;
  /** Maximum time to wait for iframe to load in milliseconds */
  timeoutDuration: number;
}

/**
 * Interface for application configuration
 * Defines all properties needed to configure an iframe application
 */
export interface Application {
  /** Unique identifier for the application */
  id: string;
  /** Display name of the application */
  name: string;
  /** URL to use in development environment */
  devUrl: string;
  /** URL to use in production environment */
  prodUrl: string;
  /** Icon path for the application */
  icon?: string;
  /** Version string */
  version?: string;
  /** Description of the application */
  description?: string;
  /** Sandbox configuration for the iframe */
  sandbox: IframeSandboxOptions;
  /** Permissions policy for the iframe */
  permissions: IframePermissionsPolicy;
  /** Loading strategy configuration */
  loading: LoadingStrategy;
  /** Error handling configuration */
  errorHandling: ErrorHandling;
  /** CSS styles for the iframe */
  styles?: {
    /** Width of the iframe */
    width?: string;
    /** Height of the iframe */
    height?: string;
    /** Border radius of the iframe */
    borderRadius?: string;
    /** Border style of the iframe */
    border?: string;
  };
}

export const defaultSandboxOptions: IframeSandboxOptions = {
  allowForms: true,
  allowScripts: true,
  allowSameOrigin: true,
  allowPopups: false,
  allowTopNavigation: false,
};

export const defaultPermissions: IframePermissionsPolicy = {
  camera: false,
  microphone: false,
  geolocation: false,
  fullscreen: true,
  payment: false,
};

export const defaultErrorHandling: ErrorHandling = {
  retryAttempts: 3,
  retryDelay: 1000,
  timeoutDuration: 10000,
};

/**
 * List of available applications
 */
export const applications: Application[] = [
  {
    id: 'client-web',
    name: 'Client Web Application',
    devUrl: 'http://localhost:3001',
    prodUrl: 'apps/client-web/index.html',
    version: '1.0.0',
    description: 'IFramed application for testing',
    sandbox: {
      ...defaultSandboxOptions,
      allowPopups: true,
    },
    permissions: {
      ...defaultPermissions,
      fullscreen: true,
    },
    loading: {
      type: 'eager',
    },
    errorHandling: {
      ...defaultErrorHandling,
      fallbackUrl: '/error.html',
    },
    styles: {
      width: '100%',
      height: '100%',
      borderRadius: '8px',
      border: 'none',
    },
  },
  {
    id: 'pump-clicker',
    name: 'Pumping Clicker Game',
    devUrl: 'http://localhost:3002/',
    prodUrl: 'apps/pump-clicker/index.html',
    version: '1.0.0',
    description: 'Popular pump clicker game',
    sandbox: {
      ...defaultSandboxOptions,
      allowScripts: true,
      allowPopups: true,
      allowSameOrigin: true,
      allowTopNavigation: true,
    },
    permissions: {
      ...defaultPermissions,
      fullscreen: true,
    },
    loading: {
      type: 'eager',
    },
    errorHandling: {
      ...defaultErrorHandling,
      retryAttempts: 5,
      timeoutDuration: 15000,
    },
    styles: {
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: '0',
    },
  },
   {
    id: 'manowar-yt',
    name: 'Manowar - Sleipnir',
    devUrl: 'https://www.youtube.com/embed/w3n2lr0yfKs',
    prodUrl: '/apps/admin-web/index.html',
    version: '1.0.0',
    description: 'Administrative dashboard',
    sandbox: {
      ...defaultSandboxOptions,
      allowPopups: true,
      allowTopNavigation: true,
    },
    permissions: {
      ...defaultPermissions,
      fullscreen: true,
    },
    loading: {
      type: 'eager',
    },
    errorHandling: {
      ...defaultErrorHandling,
      retryAttempts: 5,
    },
    styles: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
  },
  {
    id: 'admin-web',
    name: 'Admin Web Application',
    devUrl: 'http://localhost:3003',
    prodUrl: '/apps/admin-web/index.html',
    version: '1.0.0',
    description: 'Administrative dashboard',
    sandbox: {
      ...defaultSandboxOptions,
      allowPopups: true,
      allowTopNavigation: true,
    },
    permissions: {
      ...defaultPermissions,
      fullscreen: true,
    },
    loading: {
      type: 'eager',
    },
    errorHandling: {
      ...defaultErrorHandling,
      retryAttempts: 5,
    },
    styles: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
  },
  {
    id: 'agency-web',
    name: 'Agency Web Application',
    devUrl: 'http://localhost:3007',
    prodUrl: '/apps/agency-web/index.html',
    version: '1.0.0',
    description: 'Agency management portal',
    sandbox: defaultSandboxOptions,
    permissions: defaultPermissions,
    loading: {
      type: 'lazy',
      threshold: 0.1,
    },
    errorHandling: defaultErrorHandling,
    styles: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
  },
];

export const getApplication = (id: string): Application | undefined => {
  return applications.find(app => app.id === id);
};

/**
 * Get the current application based on the VITE_APP_ID environment variable
 * @returns The current application configuration
 */
export const getCurrentApplication = (): Application => {
  const appId = import.meta.env.VITE_APP_ID || 'client-web';
  const app = getApplication(appId);
  
  if (!app) {
    throw new Error(`Application with id ${appId} not found`);
  }
  
  return app;
};

export const getSandboxAttributes = (app: Application): string => {
  const options = app.sandbox;
  const attributes = [];

  if (options.allowForms) attributes.push('allow-forms');
  if (options.allowPopups) attributes.push('allow-popups');
  if (options.allowScripts) attributes.push('allow-scripts');
  if (options.allowSameOrigin) attributes.push('allow-same-origin');
  if (options.allowTopNavigation) attributes.push('allow-top-navigation');

  return attributes.join(' ');
};

export const getPermissionsPolicy = (app: Application): string => {
  const policies = Object.entries(app.permissions)
    .map(([feature, allowed]) => `${feature}=${allowed ? "'self'" : "'none'"}`)
    .join(', ');

  return policies;
};

import { isDevelopment, isNativePlatform } from './environment';

/**
 * Get the appropriate URL for the iframe based on the application and environment
 * @param app The application configuration
 * @returns The URL to use for the iframe
 */
export const getIframeUrl = (app: Application): string => {
  // Select base URL based on environment
  const baseUrl = isDevelopment() ? app.devUrl : app.prodUrl;
  
  console.log(`[getIframeUrl] App: ${app.name}, isDevelopment: ${isDevelopment()}, isNativePlatform: ${isNativePlatform()}`);
  console.log(`[getIframeUrl] Base URL: ${baseUrl}`);
  
  // Handle absolute URLs directly
  if (baseUrl.startsWith('http')) {
    // For native platforms, we need special handling of localhost URLs
    if (isNativePlatform()) {
      // If we're on a native platform and the URL is localhost, we need to use the device's IP
      if (baseUrl.includes('localhost')) {
        // For emulator, 10.0.2.2 points to the host machine's localhost
        const emulatorUrl = baseUrl.replace('localhost', '10.0.2.2');
        console.log(`[getIframeUrl] Using emulator URL: ${emulatorUrl}`);
        return emulatorUrl;
      }
      
      // Check if the URL contains an IP address that might be causing issues
      if (baseUrl.includes('192.168.1.')) {
        console.log(`[getIframeUrl] Warning: URL contains a specific IP address: ${baseUrl}`);
        console.log(`[getIframeUrl] This might cause issues on different networks`);
        
        // Try to use 10.0.2.2 for emulators
        if (baseUrl.includes('192.168.1.109')) {
          const fixedUrl = baseUrl.replace('192.168.1.109', '10.0.2.2');
          console.log(`[getIframeUrl] Replacing IP with emulator-friendly address: ${fixedUrl}`);
          return fixedUrl;
        }
      }
    }
    return baseUrl;
  }
  
  // Handle relative URLs
  if (isNativePlatform()) {
    // For native platforms, we need to construct a full URL
    const protocol = isDevelopment() ? 'http' : 'https';
    
    // Use 10.0.2.2 for emulators instead of localhost
    const host = isDevelopment() ? '10.0.2.2' : window.location.hostname;
    
    // Extract port from dev URL if available
    let port = '';
    if (isDevelopment() && app.devUrl.includes(':')) {
      const portMatch = app.devUrl.match(/:(\d+)/);
      port = portMatch ? `:${portMatch[1]}` : '';
    }
    
    // Ensure path starts with a slash
    const path = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
    
    const fullUrl = `${protocol}://${host}${port}${path}`;
    console.log(`[getIframeUrl] Constructed URL: ${fullUrl}`);
    return fullUrl;
  }
  
  // For web platforms with relative URLs, return as is
  return baseUrl;
};
