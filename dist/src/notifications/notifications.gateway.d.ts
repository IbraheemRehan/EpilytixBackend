import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSocketsMap;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitToUser(userId: string, event: string, data: any): void;
    broadcast(event: string, data: any): void;
}
