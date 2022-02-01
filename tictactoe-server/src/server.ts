import { AppExpress } from "./lib/app.express";
import express from "express";
import http from "http";
import { SocketServer } from "./lib/socket.server";
export let socketServer: SocketServer;
class Server extends AppExpress {
  private readonly httpServer: http.Server;
  constructor(app: express.Express) {
    super(app);
    this.httpServer = new http.Server(app);
    socketServer = new SocketServer(this.httpServer);
    socketServer.connect();
    this.httpServer.listen(3000);
    this.httpServer.on("error", (er: Error) => {
      console.error(`Server failed :: ${er}`)
    })
    this.httpServer.on("listening", () => {
      console.error(`Server started at 3000 port`);
    })
  }
}

const server = new Server(express());
export default server.express;