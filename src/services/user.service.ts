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
