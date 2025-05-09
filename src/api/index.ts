import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { userRouter } from '../routes/user.routes';

export async function requestHandler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const parsedUrl = parse(req.url || '', true);
  const { pathname } = parsedUrl;

  if (pathname?.startsWith('/api/users')) {
    await userRouter(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}
