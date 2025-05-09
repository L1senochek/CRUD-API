import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { requestHandler } from './api';
import colorize from './utils/colorize';

const envPath = path.resolve(__dirname, '../.env');
const DEV_PORT = 3000;

if (
  (process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'production') &&
  (!fs.existsSync(envPath) ||
    !fs.readFileSync(envPath, 'utf-8').includes(`PORT=${DEV_PORT}`))
) {
  fs.writeFileSync(envPath, `PORT=${DEV_PORT}\n`, 'utf-8');
  console.log(`.env file created/updated with PORT=${DEV_PORT}`);
}

dotenv.config();

const PORT = Number(process.env.PORT) || DEV_PORT;

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
