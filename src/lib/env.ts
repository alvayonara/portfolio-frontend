import { PUBLIC_API_BASE_URL, PUBLIC_S3_BASE_URL } from '$env/static/public';

export const API_BASE_URL = PUBLIC_API_BASE_URL || '';
export const S3_BASE_URL = PUBLIC_S3_BASE_URL || '';

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('Environment loaded:', {
    API_BASE_URL: API_BASE_URL || 'MISSING',
    S3_BASE_URL: S3_BASE_URL || 'MISSING'
  });
}
