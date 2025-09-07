// Simple in-memory credits store (replace with DB later)
type UserCredits = {
  credits: number;
  plan: string;
  subscriptionStatus: 'active' | 'inactive' | 'none';
};

const store = new Map<string, UserCredits>();

function ensureUser(userId: string) {
  if (!store.has(userId)) {
    store.set(userId, { credits: 10, plan: 'basic', subscriptionStatus: 'active' });
  }
}

export function getCredits(userId: string): UserCredits {
  ensureUser(userId);
  return store.get(userId)!;
}

export function setCredits(userId: string, value: number) {
  ensureUser(userId);
  const u = store.get(userId)!;
  u.credits = Math.max(0, Math.floor(value));
}

export function addCredits(userId: string, value: number) {
  ensureUser(userId);
  const u = store.get(userId)!;
  u.credits = Math.max(0, u.credits + Math.floor(value));
}

export function consumeCredit(userId: string): boolean {
  ensureUser(userId);
  const u = store.get(userId)!;
  if (u.credits <= 0) return false;
  u.credits -= 1;
  return true;
}
