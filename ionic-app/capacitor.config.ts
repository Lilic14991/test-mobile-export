import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.pumpclicker',
  appName: 'Pump Clicker',
  webDir: 'dist',
  server: {
    allowNavigation: [
      '*',
      'localhost:3002'
    ],
  },
  plugins: {
    Browser: {
      clearCaches: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
