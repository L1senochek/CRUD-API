import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { requestHandler } from './api';
import colorize from './utils/colorize';

const envPath = path.resolve(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'PORT=3000\n', 'utf-8');
  console.log('.env file created with default PORT=3000');
}

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(
    colorize('Server is running on port ', 'brightGreen') +
      colorize(String(PORT), 'orange')
  );
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log(colorize('Server shutdown completed', 'yellow'));
    process.exit(0);
  });
});
