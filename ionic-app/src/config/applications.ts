export interface IframeSandboxOptions {
  allowForms?: boolean;
  allowPopups?: boolean;
  allowScripts?: boolean;
  allowSameOrigin?: boolean;
  allowTopNavigation?: boolean;
}

export interface IframePermissionsPolicy {
  camera?: boolean;
  microphone?: boolean;
  geolocation?: boolean;
  fullscreen?: boolean;
  payment?: boolean;
}

export interface LoadingStrategy {
  type: 'eager' | 'lazy';
  threshold?: number; // Intersection observer threshold for lazy loading
}

export interface ErrorHandling {
  fallbackUrl?: string;
  retryAttempts: number;
  retryDelay: number; // in milliseconds
  timeoutDuration: number; // in milliseconds
}

export interface Application {
  id: string;
  name: string;
  devUrl: string;
  prodUrl: string;
  icon?: string;
  version?: string;
  description?: string;
  sandbox: IframeSandboxOptions;
  permissions: IframePermissionsPolicy;
  loading: LoadingStrategy;
  errorHandling: ErrorHandling;
  styles?: {
    width?: string;
    height?: string;
    borderRadius?: string;
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

export const applications: Application[] = [
  {
    id: 'client-web',
    name: 'Client Web Application',
    devUrl: 'http://localhost:3001',
    prodUrl: '/apps/client-web/index.html',
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
    id: 'cookie-clicker',
    name: 'Cookie Clicker Game',
    devUrl: 'http://localhost:3002',
    prodUrl: '/apps/cookie-clicker/index.html',
    version: '1.0.0',
    description: 'Pump clicker game',
    sandbox: {
      ...defaultSandboxOptions,
      allowScripts: true,
    },
    permissions: {
      ...defaultPermissions,
      fullscreen: true,
    },
    loading: {
      type: 'lazy',
      threshold: 0.5,
    },
    errorHandling: defaultErrorHandling,
  styles: {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '4px',
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
  // Use development URL in development mode, production URL in production mode
  const baseUrl = isDevelopment() ? app.devUrl : app.prodUrl;
  
  // If we're on a native platform and the URL is relative, we need to handle it differently
  if (isNativePlatform() && !baseUrl.startsWith('http')) {
    // For relative URLs in native platforms, we need to use the full URL from the app's server
    // This assumes the app is served from a domain that's accessible from the native app
    const protocol = isDevelopment() ? 'http' : 'https';
    const host = isDevelopment() ? 'localhost' : window.location.hostname;
    const port = isDevelopment() ? (app.devUrl.includes(':') ? app.devUrl.split(':')[2].split('/')[0] : '80') : '';
    
    return `${protocol}://${host}${port ? `:${port}` : ''}${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`;
  }
  
  return baseUrl;
};
