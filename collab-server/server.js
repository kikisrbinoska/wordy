import { Server } from '@hocuspocus/server';

const server = Server.configure({
  port: 1234,
  async onAuthenticate({ token, documentName }) {
    if (!token) throw new Error('Unauthenticated');
  },
});

server.listen();
