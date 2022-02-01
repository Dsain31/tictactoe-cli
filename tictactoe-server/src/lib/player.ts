import { Socket } from "socket.io";

export default class Player {
  socket: Socket;
  username: string;
  constructor(socket: Socket, username: string) {
    this.socket = socket;
    this.username = username;
  }
}