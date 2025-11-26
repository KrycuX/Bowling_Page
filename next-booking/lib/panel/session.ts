export type PanelUser = {
  id: number;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN';
};

let currentUser: PanelUser | null = null;
let csrfToken: string | null = null;

export function setPanelSession(session: { user: PanelUser; csrfToken: string }) {
  currentUser = session.user;
  csrfToken = session.csrfToken;
}

export function updateCsrfToken(token: string) {
  csrfToken = token;
}

export function clearPanelSession() {
  currentUser = null;
  csrfToken = null;
}

export function getPanelUser() {
  return currentUser;
}

export function getCsrfToken() {
  return csrfToken;
}
