import { Capacitor } from '@capacitor/core';

/**
 * Environment configuration interface
 */
interface EnvironmentConfig {
  USE_HTTPS: boolean;
}

/**
 * Configuration map for different environments
 */
interface ConfigMap {
  development: EnvironmentConfig;
  production: EnvironmentConfig;
  [key: string]: EnvironmentConfig;
}

/**
 * Environment configuration
 */
const config: ConfigMap = {
  development: {
    USE_HTTPS: false
  },
  production: {
    USE_HTTPS: true
  }
};

/**
 * Current environment (development or production)
 */
const environment: string = import.meta.env.MODE || 'development';
const currentConfig: EnvironmentConfig = config[environment] || config.development;

/**
 * Get the current environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return currentConfig;
};

/**
 * Check if the current environment is production
 */
export const isProduction = (): boolean => {
  return environment === 'production';
};

/**
 * Check if the current environment is development
 */
export const isDevelopment = (): boolean => {
  return environment === 'development';
};

/**
 * Check if the app is running on a native platform
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};
