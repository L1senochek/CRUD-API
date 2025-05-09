import { IncomingMessage, ServerResponse } from 'http';
import { createUser, getAllUsers, getUserById } from '../services/user.service';
import { validate, v4 } from 'uuid';
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
      colorize('Invalid UUID format: ', 'red') +
        colorize(`${userId} ; `, 'purple') +
        colorize('status: 400', 'yellow')
    );

    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID format' }));
    return;
  }

  const user = getUserById(userId);

  if (!user) {
    console.log(
      colorize('User not found: ', 'magenta') +
        colorize(`${userId} ; `, 'purple') +
        colorize('status: 404', 'yellow')
    );

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  console.log(
    colorize('Fetched user by ID: ', 'cyan') +
      colorize(`${userId} ; `, 'purple') +
      colorize('; status: 200', 'yellow')
  );

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
};

export const handleCreateUser = (
  req: IncomingMessage,
  res: ServerResponse
): void => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      const { username, age, hobbies } = parsed;

      if (
        typeof username !== 'string' ||
        typeof age !== 'number' ||
        !Array.isArray(hobbies) ||
        !hobbies.every((h) => typeof h === 'string')
      ) {
        console.log(
          colorize('Invalid user payload; ', 'red') +
            colorize('status: 400', 'yellow')
        );

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user data' }));
        return;
      }

      const newUser = { id: v4(), username, age, hobbies };
      createUser(newUser);

      console.log(
        colorize('User created with ID: ', 'brightGreen') +
          colorize(`${newUser.id} ; `, 'purple') +
          colorize('status: 201', 'yellow')
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newUser));
    } catch (err) {
      console.log(
        colorize('Failed to parse JSON; ', 'red') +
          colorize('status: 400', 'yellow')
      );

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid JSON' }));
    }
  });
};
