import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../database/entities';
import * as argon2 from 'argon2';

export type CreateUserInput = {
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
};

export type UpdateUserInput = {
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
};

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {console.log('AdminUsersService constructor called');}

  async listUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'role', 'isActive', 'createdAt', 'lastLoginAt'],
      order: { id: 'DESC' },
    });
  }

  async getUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'isActive', 'createdAt', 'lastLoginAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(input: CreateUserInput, adminId: number): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(input.password);

    const user = this.userRepository.create({
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      isActive: input.isActive,
    });

    return this.userRepository.save(user);
  }

  async updateUser(id: number, input: UpdateUserInput, adminId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (input.email && input.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      user.email = input.email.toLowerCase();
    }

    if (input.password) {
      user.passwordHash = await argon2.hash(input.password);
    }

    if (input.role !== undefined) {
      user.role = input.role;
    }

    if (input.isActive !== undefined) {
      user.isActive = input.isActive;
    }

    return this.userRepository.save(user);
  }
}
