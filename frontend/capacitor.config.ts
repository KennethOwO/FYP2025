import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'signbridge.frontend',
  appName: 'signbridge-frontend',
  webDir: 'dist',
  server: {
    url: 'http://192.168.15.26:5173',
    // url: 'http://localhost:5173',
    cleartext: true
  }
};

export default config;
