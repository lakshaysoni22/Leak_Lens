interface JWTPayload {
  sub: string;
  exp: number;
  iat: number;
  role: string;
}

function decodeJwtPayload<T>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwtPayload<JWTPayload>(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

export function getTokenPayload(token: string): JWTPayload | null {
  return decodeJwtPayload<JWTPayload>(token);
}

export function getStoredToken(): string | null {
  return localStorage.getItem('leaklens_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('leaklens_token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('leaklens_token');
  localStorage.removeItem('leaklens_refresh_token');
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem('leaklens_refresh_token');
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem('leaklens_refresh_token', token);
}
