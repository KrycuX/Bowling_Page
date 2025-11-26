'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/panel/api';

// --- Typy wspólne ---
export type UserRole = 'EMPLOYEE' | 'ADMIN';

export type UserListItem = {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;     // ISO
  lastLoginAt?: string | null;
};

export type UsersResponse = {
  data: UserListItem[];
};

export type CreateUserInput = {
  email: string;
  role: UserRole;
};

export type CreateUserResult = {
  id: number;
  temporaryPassword: string;
};

export type UpdateUserInput = Partial<{
  email: string;
  role: UserRole;
  isActive: boolean;
}>;

export type UpdateUserResult = {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
};

// --- Queries / Mutations ---
export function useUsersQuery() {
  return useQuery<UsersResponse>({
    queryKey: ['admin', 'users'],
    queryFn: () => apiFetch<UsersResponse>('/admin/users'),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<CreateUserResult, Error, CreateUserInput>({
    mutationFn: (body) =>
      apiFetch<CreateUserResult>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateUser(userId: number) {
  const queryClient = useQueryClient();
  return useMutation<UpdateUserResult, Error, UpdateUserInput>({
    mutationFn: (body) =>
      apiFetch<UpdateUserResult>(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
