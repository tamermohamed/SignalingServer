const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 80 }); // Change port from 80 to 8080 for non-root access

const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (e) {
            console.error(`Failed to parse message: ${message}`, e);
            return;
        }

        const { type, payload, to } = parsedMessage;

        switch (type) {
            case 'register':
                if (payload && payload.clientId) {
                    clients.set(payload.clientId, ws);
                    console.log(`Client ${payload.clientId} registered.`);
                } else {
                    console.error(`Invalid register payload: ${payload}`);
                }
                break;
            case 'offer':
            case 'answer':
            case 'candidate':
            case 'reject':
            case 'endCall':
                if (to) {
                    sendToClient(to, { type, payload });
                    console.error(`Call Started: ${to}`);
                } else {
                    console.error(`Invalid 'to' field: ${to}`);
                }
                break;
            default:
                console.error(`Unknown message type: ${type}`);
                break;
        }
    });

    ws.on('close', () => {
        for (let [clientId, clientWs] of clients) {
            if (clientWs === ws) {
                clients.delete(clientId);
                console.log(`Client ${clientId} disconnected.`);
                break;
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function sendToClient(clientId, message) {
    const clientWs = clients.get(clientId);
    if (clientWs && clientWs.readyState === WebSocket.OPEN) {
        try {
            clientWs.send(JSON.stringify(message));
        } catch (e) {
            console.error(`Failed to send message to client ${clientId}:`, e);
        }
    } else {
        console.error(`Client ${clientId} not found or connection is closed.`);
    }
}

console.log('Signaling server started');