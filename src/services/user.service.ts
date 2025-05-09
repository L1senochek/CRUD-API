import { User } from '../models/user.model';

const users: User[] = [];

export const getAllUsers = (): User[] => {
  return users;
};

export const getUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export const createUser = (user: User): void => {
  users.push(user);
};

export const updateUser = (
  id: string,
  updatedFields: Omit<User, 'id'>
): User | undefined => {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;

  users[index] = { ...users[index], ...updatedFields };
  return users[index];
};
