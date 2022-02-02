import { Socket } from "socket.io-client";
import { printInvalidMsg, promptOption, promptRoomOption, topHeaderText, print } from "../lib/blessed-configs";
import { SystemConstants } from "./system.constants";

export default class CommonService {
  static options = [SystemConstants.START, SystemConstants.JOIN, SystemConstants.SPECTATE];
  static getHostByAddress(address: string) {
    if (address && address.length > 0) {
      const splitHostAndPort = address.split(':');
      const ip = splitHostAndPort[0];
      const portNumber = splitHostAndPort[1];
      return `http://${ip}:${portNumber}`;
    } else {
      return SystemConstants.URL;
    }
  }

  private static showRoomListOptions(data: (string | { playerX: string; playerO: string; })[][]) {
    console.dir(`\n`)
    Array.from(Array(data.length).keys()).forEach((m) => {
      console.dir(`${m}. ` + JSON.stringify(data[m]));
    });
  }

  static joinRoomHandler(socket: Socket, rooms: any, name: string) {
    const roomList = JSON.parse(rooms) as (string | { playerX: string; playerO: string; })[][];
    this.showRoomListOptions(roomList);
    promptRoomOption((data: { optionChosen: string }) => {
      const option = Number(data.optionChosen);
      if (option < 0 || option > SystemConstants.ROOM_LIMIT) {
        printInvalidMsg(SystemConstants.INVALID_MSG);
      } else {
        const roomsData = roomList.map((m) => m[0])
        const containData = {
          username: name,
          roomName: roomsData[option]
        }
        socket.emit(SystemConstants.JOIN_KEY, containData);
      }
    });
  }

  static startNewGameHandler(socket: Socket, name: string) {
    console.dir(`${SystemConstants.CONNECTION_MSG} ${name} (Choose an option)`);
    topHeaderText(SystemConstants.OPTIONS_START);
    promptOption((data: { optionChosen: any }) => {
      if (!this.options.includes(data.optionChosen)) {
        print(SystemConstants.INVALID_MSG)
      }
      const choseCases: any = {
        [SystemConstants.START]: () => {
          socket.emit(SystemConstants.ENTER_KEY, name);
        },
        [SystemConstants.JOIN]: () => {
          socket.emit(SystemConstants.SHOW_ROOMS_KEY, name);
        },
        [SystemConstants.SPECTATE]: () => {

        }
      }
      choseCases[data.optionChosen]();
    });
  }
}