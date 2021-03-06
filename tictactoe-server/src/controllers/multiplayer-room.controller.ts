import { Socket } from "socket.io";
import Game from "../lib/game";
import { SystemConstants } from "../utils/constants/system.constants";

export default class MultiplayerRoomController {
  ongoing: Map<any, any>;
  constructor() {
    this.ongoing = new Map();
  }
  create(participants: any[]) {
    const game = new Game(`${SystemConstants.roomPrefix}${SystemConstants.GEN_KEY()}`, participants);
    this.ongoing.set(game.gameID, game);
    return game;
  }
  getRoom(gameID: any) {
    return this.ongoing.get(gameID);
  }
  remove(gameID: any) {
    this.ongoing.delete(gameID);
  }
  getCurrentRoomID(socket: Socket) {
    const roomID = [...socket.rooms].find((room) =>
      `${room}`.includes(SystemConstants.roomPrefix)
    )!;
    return roomID;
  }

  generateRoomId() {
    return `${SystemConstants.roomPrefix}${SystemConstants.GEN_KEY()}`;
  }
  createRoom(roomId: string, participants: any[]) {
    const game = new Game(roomId, participants);
    this.ongoing.set(game.gameID, game);
    return game;
  }
}