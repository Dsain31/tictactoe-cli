import { Socket } from "socket.io";
import MultiplayerRoomController from "../../controllers/multiplayer-room.controller";
import { SystemConstants } from "../constants/system.constants";

export default class CommonService {
  static winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]
  ];
  static checkWin(moves: { [x: string]: number[]; }, player: string | number): boolean {
    for (let i = 0, len = this.winningCombinations.length; i < len; i++) {
      const combo = this.winningCombinations[i];
      if (combo.every((c: number) => moves[player].includes(c + 1))) {
        return true;
      }
    }
    return false;
  };

  static checkIsTied(progress = ""): boolean {
    return progress.replace(/\n/g, "").split("").every((s) => s !== ".");
  };

  // static getRoomName(socket: Socket) {
  //   return new MultiplayerRoomController().getCurrentRoomID(socket)[0];
  // }
}