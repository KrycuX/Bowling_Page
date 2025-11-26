import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, User } from '../../database/entities';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createSession(userId: number, ipAddress?: string, userAgent?: string): Promise<Session> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const token = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(16).toString('hex');

    const session = this.sessionRepository.create({
      id: sessionId,
      userId,
      token,
      csrfToken,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      ipHash: ipAddress ? this.hashString(ipAddress) : null,
      userAgentHash: userAgent ? this.hashString(userAgent) : null,
      user: { id: userId } as User,
    });

    return await this.sessionRepository.save(session);
  }

  async validateSession(token: string): Promise<{ user: User; session: Session } | null> {
    const session = await this.sessionRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!session) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      await this.sessionRepository.remove(session);
      return null;
    }

    if (!session.user.isActive) {
      return null;
    }

    return {
      user: session.user,
      session,
    };
  }

  async deleteSession(token: string): Promise<void> {
    const session = await this.sessionRepository.findOne({ where: { token } });
    if (session) {
      await this.sessionRepository.remove(session);
    }
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.delete({ userId });
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < NOW()')
      .execute();

    return result.affected || 0;
  }

  async findSession(token: string): Promise<{ user: User; userId: number; csrfToken: string; expiresAt: Date } | null> {
    const session = await this.sessionRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!session) {
      return null;
    }

    return {
      user: session.user,
      userId: session.userId,
      csrfToken: session.csrfToken,
      expiresAt: session.expiresAt,
    };
  }

  isSessionExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  async refreshSession(sessionId: string): Promise<Date> {
    const newExpiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    await this.sessionRepository.update(sessionId, {
      expiresAt: newExpiresAt,
    });
    return newExpiresAt;
  }

  private hashString(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}
