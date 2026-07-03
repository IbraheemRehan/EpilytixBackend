import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketsMap = new Map<string, string[]>(); // userId -> socketIds

  handleConnection(client: Socket) {
    // Read the query parameters or handshake auth
    const userId = client.handshake.query?.userId || client.handshake.auth?.userId || client.handshake.auth?.token;
    if (userId) {
      const sockets = this.userSocketsMap.get(userId as string) || [];
      sockets.push(client.id);
      this.userSocketsMap.set(userId as string, sockets);
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSocketsMap.entries()) {
      const index = sockets.indexOf(client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSocketsMap.delete(userId);
        } else {
          this.userSocketsMap.set(userId, sockets);
        }
        break;
      }
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`user:${userId}`).emit(event, data);
    }
  }

  broadcast(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }
}
