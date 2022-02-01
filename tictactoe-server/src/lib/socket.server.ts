import { Server } from 'http'
import * as socket from 'socket.io'
import App from './app';
export class SocketServer {
  public io: socket.Server;
  private app: App;
  constructor(http: Server) {
    this.io = new socket.Server(http);
    this.app = new App(this.io);
  }

  public connect() {
    this.io.on('connection', (_socket) => {
      console.log(`New user connected to the server: ${_socket.id}`);
      // _socket.on("enter", (username) => {
      //   console.log(`${_socket.id} has entered.`);
      //   this.app.handleEnter(_socket, username)
      // });
      _socket.on("enter", (data) => {
        console.log(`${_socket.id} : ${data} has entered.`);
        this.app.handleEnter(_socket, data);
        console.log('rooms', this.io.sockets.adapter.rooms)
        this.getUserDataFromRooms(_socket.id)
      });
      _socket.on("enter-join", (data) => {
        console.log(`${_socket.id} : ${data} has joined.`);

        // _socket.join(_socket.id);
        // this.app.handleJoin(_socket, data);
        // this.app.handleEnter(_socket, data);
      });
      _socket.on("move", (move) => {
        console.log(`${_socket.id} has made move.`);
        this.app.handlePlay(_socket, move);
      });
      _socket.on("replayConfirm", (confirmed) => {
        console.log(`${_socket.id} has confirmed replay.`);
        this.app.handleReplay(_socket, confirmed);
      });
      _socket.on("disconnect", () => {
        console.log(`${_socket.id} is disconnected.`);
        _socket.disconnect();
        this.app.handleDisconnect(_socket);
      });
    })
  }

  private getUserDataFromRooms(id: string) {
    const test = this.io.sockets.adapter.rooms.get(id);
    console.log(test)
  }
}
