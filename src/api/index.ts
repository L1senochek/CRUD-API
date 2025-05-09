import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { userRouter } from './userRouter';

export function requestHandler(
  req: IncomingMessage,
  res: ServerResponse
): void {
  const parsedUrl = parse(req.url || '', true);
  const { pathname } = parsedUrl;

  if (pathname?.startsWith('/api/users')) {
    userRouter(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}
