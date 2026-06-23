import { Server } from '@hocuspocus/server';

const server = Server.configure({
  port: 1234,
  async onAuthenticate({ token, documentName }) {
    console.log('[hocuspocus] onAuthenticate doc:', documentName, 'hasToken:', !!token);
    if (!token) throw new Error('Unauthenticated');
  },
  async onConnect({ documentName, socketId }) {
    console.log('[hocuspocus] connected:', socketId, 'doc:', documentName);
  },
  async onDisconnect({ documentName, socketId }) {
    console.log('[hocuspocus] disconnected:', socketId, 'doc:', documentName);
  },
  async onChange({ documentName }) {
    console.log('[hocuspocus] change in doc:', documentName);
  },
});

server.listen();
console.log('[hocuspocus] server running on ws://localhost:1234');
