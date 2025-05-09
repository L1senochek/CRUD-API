import type { Worker } from 'cluster';

import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { requestHandler } from '../api';
import { IncomingMessage, request as httpRequest } from 'http';
import colorize from '../utils/colorize';
import { User } from '../models/user.model';

const CLUSTER_PORT = 4000;
const numCPUs = os.availableParallelism
  ? os.availableParallelism() - 1
  : os.cpus().length - 1;

const users: User[] = [];

if (cluster.isPrimary) {
  let currentWorker = 0;
  const workerPorts: number[] = [];

  console.log(colorize(`Primary process running`, 'brightGreen'));

  for (let i = 1; i <= numCPUs; i++) {
    const port = CLUSTER_PORT + i;
    const worker = cluster.fork({ PORT: String(port) });
    workerPorts.push(port);

    worker.on('message', (msg: Record<string, unknown>) => {
      if (!msg || typeof msg !== 'object') {
        return;
      }

      const { type, payload, requestId } = msg;

      switch (type) {
        case 'getAllUsers':
          worker.send({ type: 'response', payload: users, requestId });
          break;
        case 'getUserById':
          worker.send({
            type: 'response',
            payload: users.find((u) => u.id === (payload as { id: string }).id),
            requestId,
          });
          break;
        case 'createUser':
          users.push(payload as User);
          broadcastToWorkersExcept(worker, { type, payload });
          worker.send({ type: 'response', payload, requestId });
          break;
        case 'updateUser': {
          const { id, update } = payload as {
            id: string;
            update?: Partial<User>;
          };
          const index = users.findIndex((u) => u.id === id);
          if (index !== -1 && update) {
            users[index] = { ...users[index], ...update };
          }
          broadcastToWorkersExcept(worker, { type, payload });
          worker.send({
            type: 'response',
            payload: users.find((u) => u.id === id),
            requestId,
          });
          break;
        }
        case 'deleteUser': {
          const id = (payload as { id: string }).id;
          const index = users.findIndex((u) => u.id === id);
          const removed = index !== -1 ? users.splice(index, 1)[0] : null;
          broadcastToWorkersExcept(worker, { type, payload });
          worker.send({ type: 'response', payload: removed, requestId });
          break;
        }
      }
    });
  }

  function broadcastToWorkersExcept(
    sender: Worker,
    message: Record<string, unknown>
  ) {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker && worker !== sender) {
        worker.send(message);
      }
    }
  }

  const balancer = http.createServer(
    (clientReq: IncomingMessage, clientRes) => {
      const targetPort = workerPorts[currentWorker];
      currentWorker = (currentWorker + 1) % workerPorts.length;

      const proxyReq = httpRequest(
        {
          hostname: 'localhost',
          port: targetPort,
          path: clientReq.url,
          method: clientReq.method,
          headers: clientReq.headers,
        },
        (proxyRes) => {
          clientRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
          proxyRes.pipe(clientRes, { end: true });
        }
      );

      console.log(
        colorize(`Proxying request to worker on port `, 'yellow') +
          colorize(`${targetPort}`, 'orange')
      );
      clientReq.pipe(proxyReq, { end: true });
    }
  );

  balancer.listen(CLUSTER_PORT, () => {
    console.log(
      colorize('Balancer running on port ', 'brightGreen') +
        colorize(String(CLUSTER_PORT), 'orange')
    );
  });
} else {
  const port = Number(process.env.PORT);
  http.createServer(requestHandler).listen(port, () => {
    console.log(
      colorize(`Worker started on port `, 'brightGreen') +
        colorize(String(port), 'orange')
    );
  });
}
