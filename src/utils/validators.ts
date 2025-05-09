import { User } from '../models/user.model';

export const isValidUserPayload = (data: unknown): data is Omit<User, 'id'> => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }

  const user = data as Partial<Omit<User, 'id'>>;

  return (
    typeof user.username === 'string' &&
    typeof user.age === 'number' &&
    Array.isArray(user.hobbies) &&
    user.hobbies.every(
      (hobby: unknown): hobby is string => typeof hobby === 'string'
    )
  );
};
