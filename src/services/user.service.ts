import { User } from '../models/user.model';
import { sendToMaster } from './sendToMaster';
import cluster from 'cluster';

const users: User[] = [];

export const getAllUsers = async (): Promise<User[]> => {
  if (cluster.isWorker) {
    return await sendToMaster('getAllUsers');
  }
  return users;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  if (cluster.isWorker) {
    return await sendToMaster('getUserById', { id });
  }
  return users.find((u) => u.id === id);
};

export const createUser = async (user: User): Promise<void> => {
  if (cluster.isWorker) {
    return await sendToMaster('createUser', user);
  }
  users.push(user);
};

export const updateUser = async (
  id: string,
  updatedFields: Partial<User>
): Promise<User | undefined> => {
  if (cluster.isWorker) {
    return await sendToMaster('updateUser', { id, update: updatedFields });
  }
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return undefined;
  }

  users[index] = { ...users[index], ...updatedFields };
  return users[index];
};

export const deleteUser = async (id: string): Promise<User | null> => {
  if (cluster.isWorker) {
    return await sendToMaster('deleteUser', { id });
  }
  const index = users.findIndex((user) => user.id === id);
  return index !== -1 ? users.splice(index, 1)[0] : null;
};
