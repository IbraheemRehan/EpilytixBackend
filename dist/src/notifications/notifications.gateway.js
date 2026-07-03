"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let NotificationsGateway = class NotificationsGateway {
    server;
    userSocketsMap = new Map();
    handleConnection(client) {
        const userId = client.handshake.query?.userId || client.handshake.auth?.userId || client.handshake.auth?.token;
        if (userId) {
            const sockets = this.userSocketsMap.get(userId) || [];
            sockets.push(client.id);
            this.userSocketsMap.set(userId, sockets);
            client.join(`user:${userId}`);
        }
    }
    handleDisconnect(client) {
        for (const [userId, sockets] of this.userSocketsMap.entries()) {
            const index = sockets.indexOf(client.id);
            if (index !== -1) {
                sockets.splice(index, 1);
                if (sockets.length === 0) {
                    this.userSocketsMap.delete(userId);
                }
                else {
                    this.userSocketsMap.set(userId, sockets);
                }
                break;
            }
        }
    }
    emitToUser(userId, event, data) {
        if (this.server) {
            this.server.to(`user:${userId}`).emit(event, data);
        }
    }
    broadcast(event, data) {
        if (this.server) {
            this.server.emit(event, data);
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        transports: ['websocket'],
    }),
    (0, common_1.Injectable)()
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map