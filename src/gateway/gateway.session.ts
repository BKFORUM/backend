import { AuthenticatedSocket } from '@common/types';
import { Injectable } from '@nestjs/common';

export interface IGatewaySessionManager {
  getUserSocket(id: string): AuthenticatedSocket;
  setUserSocket(id: string, socket: AuthenticatedSocket): void;
  removeUserSocket(id: string): void;
  getSockets(): Map<string, AuthenticatedSocket>;
  getSocketsByUserId(userId: string): AuthenticatedSocket[];
}

@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
  private readonly sessions: Map<string, AuthenticatedSocket> = new Map();

  getUserSocket(id: string) {
    return this.sessions.get(id);
  }

  setUserSocket(userId: string, socket: AuthenticatedSocket) {
    this.sessions.set(userId, socket);
  }
  removeUserSocket(userId: string) {
    this.sessions.delete(userId);
  }
  getSockets(): Map<string, AuthenticatedSocket> {
    return this.sessions;
  }

  getSocketsByUserId(userId: string): AuthenticatedSocket[] {
    const sockets: AuthenticatedSocket[] = [];
    for (const [key, value] of this.sessions) {
      if (key.split('_')[0] === userId) sockets.push(value);
    }

    return sockets;
  }
}
