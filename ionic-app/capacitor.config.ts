import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app',
  webDir: 'dist',
  server: {
    allowNavigation: ['*'],
  },
  plugins: {
    Browser: {
      clearCaches: true
    }
  }
};

export default config;
