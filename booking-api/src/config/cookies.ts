export const SESSION_COOKIE_NAME = 'session_token';

const isProduction = process.env.NODE_ENV === 'production';

export const SESSION_COOKIE_BASE_OPTIONS = {
  httpOnly: true as const,
  secure: false, // Always false for localhost development
  sameSite: 'lax' as 'none' | 'lax' | 'strict',
  path: '/',
  domain: undefined // No domain restriction for localhost
};
