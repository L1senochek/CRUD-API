import http from 'http';
import dotenv from 'dotenv';
import { requestHandler } from './api';
import colorize from './utils/colorize';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(
    colorize('Сервер запущен на порту ', 'brightGreen') +
      colorize(String(PORT), 'orange')
  );
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log(colorize('Сервер завершён', 'yellow'));
    process.exit(0);
  });
});
