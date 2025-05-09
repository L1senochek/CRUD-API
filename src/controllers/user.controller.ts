import { ServerResponse } from 'http';
import { getAllUsers, getUserById } from '../services/user.service';
import { validate } from 'uuid';
import colorize from '../utils/colorize';

export const handleGetAllUsers = (res: ServerResponse): void => {
  const users = getAllUsers();
  console.log(colorize('Fetched user list', 'cyan'));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
};

export const handleGetUserById = (
  userId: string,
  res: ServerResponse
): void => {
  if (!validate(userId)) {
    console.log(
      colorize('Invalid UUID format: ', 'red') + colorize(userId, 'yellow')
    );

    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID format' }));
    return;
  }

  const user = getUserById(userId);

  if (!user) {
    console.log(
      colorize('User not found: ', 'magenta') + colorize(userId, 'yellow')
    );

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  console.log(
    colorize('Fetched user by ID: ', 'cyan') + colorize(userId, 'yellow')
  );

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
};
