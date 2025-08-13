export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'CareerOS',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Development Configuration
  isDev: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
  
  // Feature Flags
  enableDebugLogging: import.meta.env.VITE_DEBUG_LOGGING === 'true',
  
  // Timeouts
  requestTimeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000'),
  
  // Auth Configuration
  tokenKey: 'token',
  userKey: 'user',
} as const;

// Debug logging in development
if (config.isDev && config.enableDebugLogging) {
  console.log('🔧 CareerOS Configuration:', {
    apiUrl: config.apiUrl,
    appName: config.appName,
    appVersion: config.appVersion,
    isDev: config.isDev,
    requestTimeout: config.requestTimeout,
  });
}

export type Config = typeof config; 