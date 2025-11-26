import argon2 from 'argon2';
import { randomBytes, createHash } from 'node:crypto';

export async function hashPassword(plain: string) {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string) {
  return argon2.verify(hash, plain);
}

export function generateSessionToken() {
  return randomBytes(32).toString('hex');
}

export function generateCsrfToken() {
  return randomBytes(16).toString('hex');
}

export function generateTemporaryPassword() {
  return randomBytes(9)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 12);
}

export function hashFingerprint(value: string | undefined | null) {
  if (!value) {
    return null;
  }
  return createHash('sha256').update(value).digest('hex');
}

export function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) {
    return email;
  }
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function getClientIp(request: any): string | null {
  // Check X-Forwarded-For header (first IP in the chain)
  const xForwardedFor = request.headers?.['x-forwarded-for'];
  if (xForwardedFor) {
    return typeof xForwardedFor === 'string' 
      ? xForwardedFor.split(',')[0].trim() 
      : String(xForwardedFor).split(',')[0].trim();
  }
  
  // Check X-Real-IP header
  const xRealIp = request.headers?.['x-real-ip'];
  if (xRealIp) {
    return typeof xRealIp === 'string' ? xRealIp : String(xRealIp);
  }
  
  // Fall back to socket remote address
  if (request.socket?.remoteAddress) {
    return request.socket.remoteAddress;
  }
  
  return null;
}
