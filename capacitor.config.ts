import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agroprofit.app',
  appName: 'AgroProfit',
  webDir: 'dist',
  // Standalone offline-ready APK: bundled assets from dist/ are served locally
  // (To switch back to live webview mode, uncomment the server block below)
  // server: {
  //   url: 'https://agro-profit-pro.vercel.app',
  //   cleartext: true
  // },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
      overlaysWebView: false,
    }
  }
};

export default config;
