import { apiFetch } from './api';
import { clearPanelSession, setPanelSession, type PanelUser } from './session';

type LoginResponse = {
  user: PanelUser;
  csrfToken: string;
};

type MeResponse = LoginResponse;

export async function login(email: string, password: string) {
  const result = await apiFetch<LoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  setPanelSession(result);
  return result.user;
}

export async function logout() {
  await apiFetch<void>('/admin/auth/logout', {
    method: 'POST'
  });
  clearPanelSession();
}

export async function fetchSession() {
  const result = await apiFetch<MeResponse>('/admin/auth/me');
  setPanelSession(result);
  return result.user;
}

export function initSession(user: PanelUser | null, csrfToken: string | null) {
  if (user && csrfToken) {
    setPanelSession({ user, csrfToken });
  } else {
    clearPanelSession();
  }
}
