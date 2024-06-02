const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 443 });

const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        const { type, payload, to } = parsedMessage;

        switch (type) {
            case 'register':
                clients.set(payload.clientId, ws);
                console.log(`Client ${payload.clientId} registered.`);
                break;
            case 'offer':
                console.log('offer');
                sendToClient(to, { type: 'offer', payload: payload.offer });
                break;
            case 'answer':
                console.log('answer');
                sendToClient(to, { type: 'answer', payload: payload.answer });
                break;
            case 'candidate':
                console.log('candidate');
                sendToClient(to, { type: 'candidate', payload: payload.candidate });
                break;
            case 'reject':
                console.log('reject');
                sendToClient(to, { type: 'reject' });
                break;
            case 'endCall':
                console.log('end call');
                sendToClient(to, { type: 'endCall' });
                break;
            default:
                console.log(`Unknown message type: ${type}`);
                break;
        }
    });

    ws.on('close', () => {
        for (let [clientId, clientWs] of clients) {
            if (clientWs === ws) {
                clients.delete(clientId);
                break;
            }
        }
        console.log(`Client disconnected.`);
    });
});

function sendToClient(clientId, message) {
    const clientWs = clients.get(clientId);
    if (clientWs) {
        clientWs.send(JSON.stringify(message));
    } else {
        console.log(`Client ${clientId} not found.`);
    }
}

console.log('Signaling server started');
