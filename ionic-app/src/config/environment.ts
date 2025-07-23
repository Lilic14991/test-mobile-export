import { Capacitor } from '@capacitor/core';

interface EnvironmentConfig {
  IFRAME_HOST: string;
  IFRAME_PORT: string;
  USE_HTTPS: boolean;
}

interface ConfigMap {
  development: EnvironmentConfig;
  production: EnvironmentConfig;
  [key: string]: EnvironmentConfig;
}

const config: ConfigMap = {
  development: {
    IFRAME_HOST: import.meta.env.VITE_IFRAME_HOST || '192.186.1.108',
    IFRAME_PORT: import.meta.env.VITE_IFRAME_PORT || '3001',
    USE_HTTPS: false
  },
  production: {
    IFRAME_HOST: import.meta.env.VITE_IFRAME_HOST || 'production-domain.com',
    IFRAME_PORT: import.meta.env.VITE_IFRAME_PORT || '443',
    USE_HTTPS: true
  }
};

const environment: string = import.meta.env.MODE || 'development';
const currentConfig: EnvironmentConfig = config[environment] || config.development;

export const getIframeUrl = (path: string = ''): string => {
  const protocol: string = currentConfig.USE_HTTPS ? 'https' : 'http';
  const host: string = currentConfig.IFRAME_HOST;
  const port: string = currentConfig.IFRAME_PORT;
  
  if (Capacitor.isNativePlatform()) {
    return `${protocol}://${host}:${port}${path}`;
  }
  
  // For web development, always use localhost
  return `http://localhost:${port}${path}`;
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return currentConfig;
};

export const isProduction = (): boolean => {
  return environment === 'production';
};

export const isDevelopment = (): boolean => {
  return environment === 'development';
};