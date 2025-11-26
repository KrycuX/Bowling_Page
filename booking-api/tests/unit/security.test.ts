import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from '../../src/utils/security';

describe('security utilities', () => {
  it('hashes passwords and verifies valid credentials', async () => {
    const password = 'Admin123!';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);
    await expect(verifyPassword(hash, password)).resolves.toBe(true);
    await expect(verifyPassword(hash, 'Wrong123!')).resolves.toBe(false);
  });

  it('generates different hashes for the same password', async () => {
    const password = 'Repeatable123!';
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first).not.toEqual(second);
  });
});
