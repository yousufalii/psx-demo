export const IS_PUBLIC_KEY = 'isPublic';

export function getSessionCookieName(nodeEnv: string): string {
  return nodeEnv === 'production' ? '__Host-psx_session' : 'psx_session';
}
