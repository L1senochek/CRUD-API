import cluster from 'cluster';
import { v4 } from 'uuid';

type MessageType =
  | 'getAllUsers'
  | 'getUserById'
  | 'createUser'
  | 'updateUser'
  | 'deleteUser';

interface MasterResponse {
  type: 'response';
  payload: unknown;
  requestId: string;
}

export function sendToMaster<T = unknown>(
  type: MessageType,
  payload?: unknown
): Promise<T> {
  if (cluster.isPrimary || !process.send) {
    throw new Error('sendToMaster can only be used in worker processes');
  }

  const requestId = v4();

  return new Promise((resolve) => {
    const handleMessage = (msg: MasterResponse) => {
      if (msg.requestId === requestId) {
        process.removeListener('message', handleMessage as any);
        resolve(msg.payload as T);
      }
    };

    process.on('message', handleMessage as any);
    if (typeof process.send === 'function') {
      process.send({ type, payload, requestId });
    }
  });
}
