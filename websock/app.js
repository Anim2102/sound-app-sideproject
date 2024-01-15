const WebSocket = require('ws');
const server = new WebSocket.Server({ host: '0.0.0.0', port: 3000 });

let clients = [];
const MAX_CLIENTS = 2;
let clientId = 0;

server.on('connection', (ws) => {
  if (clients.length >= MAX_CLIENTS) {
    ws.send('Server is full');
    ws.close();
    return;
  }
  ws.id = clientId++; 
  clients.push(ws);
  console.log('New client connected');
  clients.forEach(client => console.log('Connected client ID:', client.id));

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    console.log('Received message:', message);
  
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        switch(msg.type) {
          case 'offer':
            console.log("Offer received, forwarding to other client");
            client.send(JSON.stringify({ type: 'offer', offer: msg.offer }));
            break;
          case 'answer':
            console.log("Answer received, forwarding to other client");
            client.send(JSON.stringify({ type: 'answer', answer: msg.answer }));
            break;
          case 'ice-candidate':
            console.log("ICE candidate received, forwarding to other client");
            client.send(JSON.stringify({ type: 'ice-candidate', candidate: msg.candidate }));
            break;
          default:
            console.log("Unknown message type received");
            console.log(msg);

        }
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws);
  });
});

console.log('WebSocket server started on port 3000');