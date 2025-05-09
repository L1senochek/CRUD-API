import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetAllUsers,
  handleGetUserById,
  handleNotFound,
  handleUpdateUser,
} from '../controllers/user.controller';
import { handleServerError } from '../utils/handleServerError';

export async function userRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const parsedUrl = parse(req.url || '', true);
    const { pathname } = parsedUrl;

    if (
      req.method === 'GET' &&
      (pathname === '/api/users' || pathname === '/api/users/')
    ) {
      await handleGetAllUsers(res);
      return;
    }

    if (req.method === 'GET' && pathname?.startsWith('/api/users/')) {
      const parts = pathname.split('/');
      const userId = parts[3];

      await handleGetUserById(userId, res);
      return;
    }

    if (
      req.method === 'POST' &&
      (pathname === '/api/users' || pathname === '/api/users/')
    ) {
      await handleCreateUser(req, res);
      return;
    }

    if (req.method === 'PUT' && pathname?.startsWith('/api/users/')) {
      const parts = pathname.split('/');
      const userId = parts[3];

      await handleUpdateUser(req, res, userId);
      return;
    }

    if (req.method === 'DELETE' && pathname?.startsWith('/api/users/')) {
      const parts = pathname.split('/');
      const userId = parts[3];

      await handleDeleteUser(userId, res);
      return;
    }

    handleNotFound(res);
  } catch (error) {
    handleServerError(res, error);
  }
}
