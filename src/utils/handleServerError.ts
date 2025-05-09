import { ServerResponse } from 'http';
import colorize from './colorize';

export function handleServerError(res: ServerResponse, error: unknown): void {
  console.error(
    colorize('Internal Server Error: ', 'red') +
      colorize(String(error), 'purple') +
      colorize(`; status: `, 'cyan') +
      colorize(`500`, 'red')
  );

  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Internal Server Error' }));
}
