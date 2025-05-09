import { IncomingMessage, ServerResponse } from 'http';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../services/user.service';
import { validate, v4 } from 'uuid';
import colorize from '../utils/colorize';
import { isValidUserPayload } from '../utils/validators';

function parseRequestBody(
  req: IncomingMessage,
  onSuccess: (parsed: unknown) => void,
  onError: (statusMessage: string) => void
): void {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      onSuccess(parsed);
    } catch {
      onError('Invalid JSON');
    }
  });
}

function rejectIfInvalidUUID(userId: string, res: ServerResponse): boolean {
  if (!validate(userId)) {
    console.log(
      colorize('Invalid UUID format: ', 'red') +
        colorize(`${userId} ; `, 'purple') +
        colorize('status: 400', 'yellow')
    );

    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID format' }));
    return true;
  }
  return false;
}

export const handleGetAllUsers = (res: ServerResponse): void => {
  const users = getAllUsers();
  console.log(
    colorize('Fetched user list; ', 'cyan') + colorize('status: 200', 'yellow')
  );

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
};

export const handleGetUserById = (
  userId: string,
  res: ServerResponse
): void => {
  if (rejectIfInvalidUUID(userId, res)) {
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
  parseRequestBody(
    req,
    (parsed) => {
      if (!isValidUserPayload(parsed)) {
        console.log(
          colorize('Invalid user payload; ', 'red') +
            colorize('status: 400', 'yellow')
        );
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user data' }));
        return;
      }

      const newUser = { id: v4(), ...parsed };
      createUser(newUser);
      console.log(
        colorize('User created with ID: ', 'brightGreen') +
          colorize(`${newUser.id} ; `, 'purple') +
          colorize('status: 201', 'yellow')
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newUser));
    },
    (errMsg) => {
      console.log(
        colorize('Failed to parse JSON; ', 'red') +
          colorize('status: 400', 'yellow')
      );
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: errMsg }));
    }
  );
};

export const handleUpdateUser = (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string
): void => {
  if (rejectIfInvalidUUID(userId, res)) {
    return;
  }

  parseRequestBody(
    req,
    (parsed) => {
      if (!isValidUserPayload(parsed)) {
        console.log(
          colorize('Invalid user payload; ', 'red') +
            colorize('status: 400', 'yellow')
        );
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user data' }));
        return;
      }

      const updated = updateUser(userId, parsed);
      if (!updated) {
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
        colorize('User updated: ', 'brightGreen') +
          colorize(`${userId} ; `, 'purple') +
          colorize('status: 200', 'yellow')
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated));
    },
    (errMsg) => {
      console.log(
        colorize('Failed to parse JSON; ', 'red') +
          colorize('status: 400', 'yellow')
      );
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: errMsg }));
    }
  );
};

export const handleDeleteUser = (userId: string, res: ServerResponse): void => {
  if (rejectIfInvalidUUID(userId, res)) {
    return;
  }

  const deleted = deleteUser(userId);
  if (!deleted) {
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
    colorize('User deleted: ', 'brightGreen') +
      colorize(`${userId} ; `, 'purple') +
      colorize('status: 204', 'yellow')
  );

  res.writeHead(204);
  res.end();
};
