import { WebSocketServer, WebSocket } from 'ws';
import { Server, IncomingMessage } from 'http';
import IORedis from 'ioredis';
import cookie from 'cookie';

const redis = new IORedis(process.env.REDIS_URL as string);

export const conversationClients = new Map<string, WebSocket>();
export const globalClients = new Map<string, WebSocket>();

const initWebSocket = (
    server: Server,
    path: string,
    clientsMap: Map<string, WebSocket>,
    type: 'conversation' | 'global'
) => {
    const wss = new WebSocketServer({ server, path });

    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        const cookies = cookie.parse(req.headers.cookie || '');
        const userId = cookies.userId ?? "cmh5722l30000pu0r62v3ptus"; //mockar id do user pra testar mais rapido

        if (!userId) {
            console.log(`Connection rejected from ${req.socket.remoteAddress}: missing userId cookie.`);
            ws.close(4001, 'Unauthorized');
            return;
        }

        const clientId = userId ;
        clientsMap.set(clientId, ws);
        console.log(`${type === 'conversation' ? 'Conversation' : 'Global'} Client ${clientId} connected`);

        ws.send(JSON.stringify({ type: 'connection', clientId, socketType: type }));

        ws.on('close', async () => {
            if (type === 'conversation') {
                await redis.del(`client:${clientId}:watching`);
            }

            if (type === 'global') {
                const channelId = await redis.get(`client:${clientId}:channel`);
                if (channelId) {
                    await redis.srem(`channel:${channelId}:global`, clientId);
                }
                await redis.del(`client:${clientId}:channel`);
            }

            clientsMap.delete(clientId);
            console.log(`${type === 'conversation' ? 'Conversation' : 'Global'} Client ${clientId} disconnected`);
        });

        ws.on('error', (error) => {
            console.error(`${type === 'conversation' ? 'Conversation' : 'Global'} Client ${clientId} error:`, error);
            clientsMap.delete(clientId);
        });

        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());

                if (message.type === 'watchConversation') {
                    const { conversationId } = message;
                    await redis.set(`client:${clientId}:watching`, conversationId);
                    console.log(`Client ${clientId} watching conversation ${conversationId}`);
                }

                if (message.type === 'unwatchConversation') {
                    await redis.del(`client:${clientId}:watching`);
                    console.log(`Client ${clientId} stopped watching conversation`);
                }

                if (message.type === 'joinChannel') {
                    const { channelId } = message;
                    await redis.sadd(`channel:${channelId}:global`, clientId);
                    await redis.set(`client:${clientId}:channel`, channelId);
                    console.log(`Client ${clientId} joined global channel ${channelId}`);
                }

                if (message.type === 'leaveChannel') {
                    const { channelId } = message;
                    await redis.srem(`channel:${channelId}:global`, clientId);
                    await redis.del(`client:${clientId}:channel`);
                    console.log(`Client ${clientId} left global channel ${channelId}`);
                }

            } catch (error) {
                console.error(`Error parsing ${type} message:`, error);
            }
        });
    });

    return wss;
};

export const initConversationWebSocket = (server: Server) => {
    return initWebSocket(server, '/ws-conversation', conversationClients, 'conversation');
}; //todo acho q nao vai usar

export const initGlobalWebSocket = (server: Server) => {
    return initWebSocket(server, '/ws-global', globalClients, 'global');
};

// Conversation WebSocket
export const sendToConversationClient = (clientId: string, message: object) => {
    const client = conversationClients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        return true;
    }
    return false;
};

export const broadcastToWatchingConversation = async (conversationId: string, message: object) => {
    const keys = await redis.keys('client:*:watching');

    let count = 0;
    for (const key of keys) {
        const watchingConversationId = await redis.get(key);
        if (watchingConversationId === conversationId) {
            const clientId = key.replace('client:', '').replace(':watching', '');
            if (sendToConversationClient(clientId, message)) {
                count++;
            }
        }
    }
    console.log(`Broadcast to ${count} clients watching conversation ${conversationId}`);
    return count;
};

// Global WebSocket
export const sendToGlobalClient = (clientId: string, message: object) => {
    const client = globalClients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        return true;
    }
    return false;
};

export const broadcastToChannel = async (channelId: string, message: object) => {
    const clients = await redis.smembers(`channel:${channelId}:global`);
    let count = 0;

    clients.forEach(clientId => {
        if (sendToGlobalClient(clientId, message)) {
            count++;
        }
    });

    console.log(`Broadcast to ${count} clients in channel ${channelId}`);
    return count;
};

export const broadcastToAllConversations = (message: object) => {
    const serializedMessage = JSON.stringify(message);
    let count = 0;

    conversationClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(serializedMessage);
            count++;
        }
    });

    console.log(`Broadcast to ${count} conversation clients`);
    return count;
}; //todo acho q nao vai usar

export const broadcastToAllGlobals = (message: object) => {
    const serializedMessage = JSON.stringify(message);
    let count = 0;

    globalClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(serializedMessage);
            count++;
        }
    });

    console.log(`Broadcast to ${count} global clients`);
    return count;
}; //todo acho q nao vai usar

export const getConnectedConversationClients = (): string[] => {
    return Array.from(conversationClients.keys());
}; //todo acho q nao vai usar

export const getConnectedGlobalClients = (): string[] => {
    return Array.from(globalClients.keys());
}; //todo acho q nao vai usar
