import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';


vi.mock('../../src/lib/prisma', () => ({
  prisma: {}
}));

const listAdminOrdersMock = vi.fn();
const getAdminOrderMock = vi.fn();
const createAdminOrderMock = vi.fn();
const updateAdminOrderMock = vi.fn();
const cancelAdminOrderMock = vi.fn();
const deleteAdminOrderMock = vi.fn();

vi.mock('../../src/services/adminOrderService', () => ({
  listAdminOrders: listAdminOrdersMock,
  getAdminOrder: getAdminOrderMock,
  createAdminOrder: createAdminOrderMock,
  updateAdminOrder: updateAdminOrderMock,
  cancelAdminOrder: cancelAdminOrderMock,
  deleteAdminOrder: deleteAdminOrderMock
}));

const findSessionMock = vi.fn();
const refreshSessionMock = vi.fn();
const isSessionExpiredMock = vi.fn();

vi.mock('../../src/services/sessionService', () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  findSession: findSessionMock,
  refreshSession: refreshSessionMock,
  isSessionExpired: isSessionExpiredMock
}));

vi.mock('../../src/services/auditService', () => ({
  logAudit: vi.fn()
}));

describe('admin order routes', () => {
  const session = {
    id: 'sess_1',
    userId: 42,
    token: 'session_token',
    csrfToken: 'csrf-token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    user: {
      id: 42,
      email: 'employee@local',
      role: 'EMPLOYEE',
      isActive: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    findSessionMock.mockResolvedValue(session);
    refreshSessionMock.mockResolvedValue(new Date(Date.now() + 60 * 60 * 1000));
    isSessionExpiredMock.mockReturnValue(false);
  });

  it('creates an onsite reservation', async () => {
    const payload = {
      customer: {
        email: 'jan@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: '123456789'
      },
      items: [
        {
          resourceId: 1,
          date: '2024-05-10',
          start: '10:00',
          duration: 1,
          pricingMode: 'PER_RESOURCE_PER_HOUR'
        }
      ],
      payment: {
        method: 'ON_SITE_CASH'
      }
    };

    createAdminOrderMock.mockResolvedValue({
      id: 'ord_123',
      status: 'PAID',
      totalAmount: 12000,
      currency: 'PLN',
      customerName: 'Jan Kowalski',
      customerEmail: 'jan@example.com',
      customerPhone: '123456789',
      items: [],
      reservedSlots: []
    });

    vi.resetModules();
    const { app } = await import('../../src/app');

    const response = await request(app)
      .post('/admin/orders')
      .set('Cookie', ['session_token=session_token'])
      .set('X-CSRF-Token', 'csrf-token')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBe('ord_123');
    expect(createAdminOrderMock).toHaveBeenCalledWith(payload, session.userId);
  });

  it('propagates slot conflicts as 409 errors', async () => {
    vi.resetModules();
    const { ConflictError } = await import('../../src/utils/errors');
    updateAdminOrderMock.mockRejectedValue(new ConflictError('Slot conflict'));

    const { app } = await import('../../src/app');

    const response = await request(app)
      .patch('/admin/orders/ord_123')
      .set('Cookie', ['session_token=session_token'])
      .set('X-CSRF-Token', 'csrf-token')
      .send({
        items: [
          {
            resourceId: 1,
            date: '2024-05-10',
            start: '11:00',
            duration: 2,
            pricingMode: 'PER_RESOURCE_PER_HOUR'
          }
        ]
      });

    expect(response.status).toBe(409);
    expect(response.body.error.message).toMatch(/slot conflict/i);
  });

  it('cancels an order and returns updated payload', async () => {
    cancelAdminOrderMock.mockResolvedValue({
      id: 'ord_123',
      status: 'CANCELLED',
      customerEmail: 'jan@example.com',
      reservedSlots: []
    });

    vi.resetModules();
    const { app } = await import('../../src/app');

    const response = await request(app)
      .post('/admin/orders/ord_123/cancel')
      .set('Cookie', ['session_token=session_token'])
      .set('X-CSRF-Token', 'csrf-token')
      .send({ reason: 'Client request' });

    expect(response.status).toBe(200);
    expect(cancelAdminOrderMock).toHaveBeenCalledWith('ord_123', 'Client request', session.userId);
    expect(response.body.status).toBe('CANCELLED');
  });
});
