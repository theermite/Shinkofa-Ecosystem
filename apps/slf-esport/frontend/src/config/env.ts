/**
 * Environment configuration
 */

const env = {
  // Use empty string for relative URLs - nginx will proxy /api to backend
  apiUrl: import.meta.env.VITE_API_URL || '',
  wsUrl: import.meta.env.VITE_WEBSOCKET_URL || 'wss://lslf.shinkofa.com/ws',
  environment: import.meta.env.VITE_ENVIRONMENT || 'production',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

export default env
