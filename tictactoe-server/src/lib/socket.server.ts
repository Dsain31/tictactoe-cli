import { Server } from 'http'
import * as socket from 'socket.io'
import { SystemConstants } from '../utils/constants/system.constants';
import App from './app';
export class SocketServer {
  public io: socket.Server;
  private app: App;
  constructor(http: Server) {
    this.io = new socket.Server(http);
    this.app = new App(this.io);
  }

  public connect() {
    this.io.on(SystemConstants.CONNECTION_KEY, (_socket) => {
      // console.log('rooms', this.io.sockets.adapter.rooms)
      console.log(`${SystemConstants.NEW_USER_CONNECTED_MSG} ${_socket.id}`);
      // _socket.on("enter", (username) => {
      //   console.log(`${_socket.id} has entered.`);
      //   this.app.handleEnter(_socket, username)
      // });
      _socket.on(SystemConstants.ENTER_KEY, (data) => {
        console.log(`${_socket.id} : ${data} has entered.`);
        this.app.handleEnter(_socket, data);
        // console.log('rooms', this.io.sockets.adapter.rooms);
        // this.getUserDataFromRooms(_socket.id)
      });
      _socket.on(SystemConstants.JOIN_KEY, (data) => {
        console.log(`${_socket.id} : ${data} has joined.`);

        // _socket.join(_socket.id);
        this.app.handleJoin(_socket, data, this.io.sockets.adapter.rooms);
        // const rooms = this.app.getRoomList();
        // console.log(rooms);
        // this.io.emit(SystemConstants.ROOM_LIST, JSON.stringify({ data: rooms }))
      });
      _socket.on(SystemConstants.MOVE_KEY, (move) => {
        console.log(`${_socket.id} has made move.`);
        this.app.handlePlay(_socket, move);
      });
      _socket.on(SystemConstants.REPLAY_CONFIRM_KEY, (confirmed) => {
        console.log(`${_socket.id} has confirmed replay.`);
        this.app.handleReplay(_socket, confirmed);
      });
      _socket.on(SystemConstants.DISCONNECT_KEY, () => {
        console.log(`${_socket.id} is disconnected.`);
        this.app.handleDisconnect(_socket);
      });
    })
  }
}
