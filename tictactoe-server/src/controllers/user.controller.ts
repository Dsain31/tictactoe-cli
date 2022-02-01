import { Socket } from "socket.io";
import Player from "../lib/player";

export default class UserController {
  players: Map<any, any>;
  queue: Player[];
  users!: any[];
  constructor() {
    this.players = new Map();
    this.queue = [];
  }
  get queueSize() {
    return this.queue.length;
  }
  add2Store(): Player[] {
    const twoPlayers = this.queue.splice(0, 2);
    const [p1, p2] = twoPlayers;
    this.players.set(p1.socket.id, p1);
    this.players.set(p2.socket.id, p2);
    return twoPlayers;
  }
  add2Queue(socket: Socket, username: string) {
    const player = new Player(socket, username);
    this.queue.push(player);
  }
  getPlayer(socketID: any) {
    return this.players.get(socketID);
  }
  remove(socketID: any) {
    this.players.delete(socketID);
  }
  checkExists(username: string) {
    const users = [...this.players.values(), ...this.queue];
    return users.find((user) => user.username === username);
  }

  joinPlayer(username: string) {
    const users = [...this.players.values(), ...this.queue];
    console.log('users', users);
  }
}