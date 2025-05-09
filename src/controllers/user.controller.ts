import { IncomingMessage, ServerResponse } from 'http';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../services/user.service';
import { validate, v4 } from 'uuid';
import colorize, { ColorKey } from '../utils/colorize';
import { isValidUserPayload } from '../utils/validators';

async function parseRequestBody(
  req: IncomingMessage,
  onSuccess: (parsed: unknown) => void,
  onError: (statusMessage: string) => void
): Promise<void> {
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

function respondWithJSON(
  res: ServerResponse,
  status: number,
  payload: object,
  logMessage?: string,
  logId?: string
): void {
  const colorMap: Record<number, ColorKey> = {
    200: 'brightGreen',
    201: 'brightGreen',
    204: 'brightGreen',
    400: 'yellow',
    404: 'red',
  };

  const prefixMap: Record<number, ColorKey> = {
    200: 'brightGreen',
    201: 'brightGreen',
    204: 'brightGreen',
    400: 'red',
    404: 'magenta',
  };

  if (logMessage) {
    console.log(
      colorize(logMessage + ': ', prefixMap[status]) +
        (logId ? colorize(`${logId} ; `, 'purple') : '') +
        colorize(`status: `, 'cyan') +
        colorize(`${status}`, colorMap[status])
    );
  }

  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(status !== 204 ? JSON.stringify(payload) : undefined);
}

function rejectIfInvalidUUID(userId: string, res: ServerResponse): boolean {
  if (!validate(userId)) {
    respondWithJSON(
      res,
      400,
      { message: 'Invalid UUID format' },
      'Invalid UUID format',
      userId
    );
    return true;
  }
  return false;
}

export const handleGetAllUsers = async (res: ServerResponse): Promise<void> => {
  const users = await getAllUsers();
  respondWithJSON(res, 200, users, 'Fetched user list');
};

export const handleGetUserById = async (
  userId: string,
  res: ServerResponse
): Promise<void> => {
  if (rejectIfInvalidUUID(userId, res)) {
    return;
  }

  const user = await getUserById(userId);
  if (!user) {
    return respondWithJSON(
      res,
      404,
      { message: 'User not found' },
      'User not found',
      userId
    );
  }

  respondWithJSON(res, 200, user, 'Fetched user by ID', userId);
};

export const handleCreateUser = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  await parseRequestBody(
    req,
    (parsed) => {
      if (!isValidUserPayload(parsed)) {
        return respondWithJSON(
          res,
          400,
          { message: 'Invalid user data' },
          'Invalid user data'
        );
      }

      const newUser = {
        id: v4(),
        username: parsed.username,
        age: parsed.age,
        hobbies: parsed.hobbies,
      };

      createUser(newUser);
      respondWithJSON(res, 201, newUser, 'User created with ID', newUser.id);
    },
    (errMsg) => respondWithJSON(res, 400, { message: errMsg }, errMsg)
  );
};

export const handleUpdateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string
): Promise<void> => {
  if (rejectIfInvalidUUID(userId, res)) {
    return;
  }

  await parseRequestBody(
    req,
    async (parsed) => {
      if (!isValidUserPayload(parsed)) {
        return respondWithJSON(
          res,
          400,
          { message: 'Invalid user data' },
          'Invalid user data'
        );
      }

      const updated = await updateUser(userId, parsed);
      if (!updated) {
        return respondWithJSON(
          res,
          404,
          { message: 'User not found' },
          'User not found',
          userId
        );
      }

      respondWithJSON(res, 200, updated, 'User updated', userId);
    },
    (errMsg) => respondWithJSON(res, 400, { message: errMsg }, errMsg)
  );
};

export const handleDeleteUser = async (
  userId: string,
  res: ServerResponse
): Promise<void> => {
  if (rejectIfInvalidUUID(userId, res)) {
    return;
  }

  const deleted = await deleteUser(userId);
  if (!deleted) {
    return respondWithJSON(
      res,
      404,
      { message: 'User not found' },
      'User not found',
      userId
    );
  }

  respondWithJSON(res, 204, {}, 'User deleted', userId);
};

export const handleNotFound = (res: ServerResponse): void => {
  respondWithJSON(res, 404, { message: 'Route not found' }, 'Route not found');
};
