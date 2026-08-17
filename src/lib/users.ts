import type { Role } from './auth';

export interface User {
  id: string;
  username: string;
  password: string; // plain text for demo purposes only — never do this in production
  role: Role;
  name: string;
}

// In-memory mock "database". Swap this out for a real DB lookup in production.
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Alice Admin',
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    role: 'user',
    name: 'Bob User',
  },
];

export function findUser(username: string, password: string): User | undefined {
  return users.find((u) => u.username === username && u.password === password);
}
