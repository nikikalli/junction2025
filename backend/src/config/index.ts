import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  braze: {
    apiKey: process.env.BRAZE_API_KEY || '',
    restEndpoint: process.env.BRAZE_REST_ENDPOINT || 'https://rest.fra-01.braze.eu',
  },
} as const;
