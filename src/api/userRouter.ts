import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { getAllUsers } from '../services/user.service';
import colorize from '../utils/colorize';

export function userRouter(req: IncomingMessage, res: ServerResponse): void {
  const parsedUrl = parse(req.url || '', true);
  const { pathname } = parsedUrl;

  if (req.method === 'GET' && pathname === '/api/users') {
    const users = getAllUsers();
    console.log(colorize('Fetched user list', 'cyan'));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'User route not found' }));
}
