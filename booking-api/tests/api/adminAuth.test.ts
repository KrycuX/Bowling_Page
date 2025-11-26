import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaUserFindUnique = vi.fn();
const prismaUserUpdate = vi.fn();

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: prismaUserFindUnique,
      update: prismaUserUpdate
    }
  }
}));

const createSessionMock = vi.fn();

vi.mock('../../src/services/sessionService', () => ({
  createSession: createSessionMock,
  deleteSession: vi.fn(),
  findSession: vi.fn(),
  refreshSession: vi.fn(),
  isSessionExpired: vi.fn()
}));

const logAuditMock = vi.fn();

vi.mock('../../src/services/auditService', () => ({
  logAudit: logAuditMock
}));

const verifyPasswordMock = vi.fn();

vi.mock('../../src/utils/security', () => ({
  verifyPassword: verifyPasswordMock,
  maskEmail: (email: string) => email
}));

describe('POST /admin/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a session and returns authentication context', async () => {
    const userRecord = {
      id: 1,
      email: 'employee@local.test',
      passwordHash: 'hash',
      role: 'EMPLOYEE',
      isActive: true
    };

    prismaUserFindUnique.mockResolvedValue(userRecord);
    prismaUserUpdate.mockResolvedValue(undefined);
    verifyPasswordMock.mockResolvedValue(true);
    createSessionMock.mockResolvedValue({
      token: 'session-token',
      csrfToken: 'csrf-token',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    vi.resetModules();
    const { app } = await import('../../src/app');

    const response = await request(app).post('/admin/auth/login').send({
      email: 'employee@local.test',
      password: 'Admin123!'
    });

    expect(response.status).toBe(200);
    expect(verifyPasswordMock).toHaveBeenCalledWith('hash', 'Admin123!');

    const [sessionCall] = createSessionMock.mock.calls;
    expect(sessionCall[0]).toBe(userRecord.id);
    expect(typeof sessionCall[1]).toBe('string');
    expect(sessionCall[2]).toBeUndefined();
    expect(response.headers['x-csrf-token']).toBe('csrf-token');
    expect(response.headers['set-cookie']?.[0]).toContain('session_token=session-token');
    expect(response.body.user).toEqual({
      id: 1,
      email: 'employee@local.test',
      role: 'EMPLOYEE'
    });
    expect(response.body.csrfToken).toBe('csrf-token');
    expect(logAuditMock).toHaveBeenCalled();
  });
});
