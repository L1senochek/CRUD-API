import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUser,
} from '../controllers/user.controller';

export function userRouter(req: IncomingMessage, res: ServerResponse): void {
  const parsedUrl = parse(req.url || '', true);
  const { pathname } = parsedUrl;

  if (req.method === 'GET' && pathname === '/api/users') {
    handleGetAllUsers(res);
    return;
  }

  if (req.method === 'GET' && pathname?.startsWith('/api/users/')) {
    const parts = pathname.split('/');
    const userId = parts[3];

    handleGetUserById(userId, res);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/users') {
    handleCreateUser(req, res);
    return;
  }

  if (req.method === 'PUT' && pathname?.startsWith('/api/users/')) {
    const parts = pathname.split('/');
    const userId = parts[3];

    handleUpdateUser(req, res, userId);
    return;
  }

  if (req.method === 'DELETE' && pathname?.startsWith('/api/users/')) {
    const parts = pathname.split('/');
    const userId = parts[3];

    handleDeleteUser(userId, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'User route not found' }));
}
