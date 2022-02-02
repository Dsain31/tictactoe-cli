import io, { Socket, SocketOptions } from 'socket.io-client';
import {
  print,
  drawBoard,
  clearPrint,
  confirmReplay,
  askUsername,
  printScoreboard,
  showGameOver,
  topHeaderText,
  promptOption
} from './lib/blessed-configs';
import CommonService from './utils/common.service';
import { SystemConstants } from './utils/system.constants';
class ClientTest {
  address: string;
  name: string;
  socket: Socket;
  options = [SystemConstants.START, SystemConstants.JOIN, SystemConstants.SPECTATE];
  hostName: string;
  socketId: string;
  constructor() {
    this.address = process.argv[2];
    this.hostName = CommonService.getHostByAddress(this.address);
    this.name = process?.argv[3];
    this.socket = io(this.hostName, { secure: true });
    this.socketId = this.socket.id;
    this.initializeConnection();
    this.initializeScoreboard();
    this.checkExistsUser();
    this.playingProgressBoard();
    this.showMessages();
    this.checkGameIsOverOrNot();
    this.replayConfirm();
    this.disconnect();
    this.getRoomList();
  }

  initializeConnection() {
    this.socket.on(SystemConstants.CONNECT_KEY, () => {

      console.log(`${SystemConstants.CONNECTION_MSG} ${this.name} (Choose an option)`);
      topHeaderText(SystemConstants.OPTIONS_START);
      // if (this.socket.id) {
      //   test(SystemConstants.OPTIONS_JOIN);
      // } else {
      // }

      promptOption((data: { optionChosen: any }) => {
        if (!this.options.includes(data.optionChosen)) {
          print(SystemConstants.INVALID_MSG)
        }
        // if (this.socket.id) {
        //   const choseCases: any = {
        //     [SystemConstants.START]: () => {
        //       print(SystemConstants.INVALID_MSG);
        //     },
        //     [SystemConstants.JOIN]: () => {
        //       console.log('join');
        //       this.socket.emit("enter-join", this.name);
        //     },
        //     [SystemConstants.SPECTATE]: () => {

        //     }
        //   }
        //   choseCases[data.optionChosen]();
        // } else {
        //   const choseCases: any = {
        //     [SystemConstants.START]: () => {
        //       this.socket.emit("enter", this.name);
        //     },
        //     [SystemConstants.JOIN]: () => {
        //       console.log('join');
        //       this.socket.emit("enter-join", this.name);
        //     },
        //     [SystemConstants.SPECTATE]: () => {

        //     }
        //   }
        //   choseCases[data.optionChosen]();
        // }
        const choseCases: any = {
          [SystemConstants.START]: () => {
            this.socket.emit(SystemConstants.ENTER_KEY, this.name);
          },
          [SystemConstants.JOIN]: () => {
            this.socket.emit(SystemConstants.JOIN_KEY, this.name);
          },
          [SystemConstants.SPECTATE]: () => {

          }
        }
        choseCases[data.optionChosen]();

        // const choseCases: any = {
        //   [SystemConstants.START]: () => {
        //     this.socket.emit("enter", this.name);
        //   },
        //   [SystemConstants.JOIN]: () => {
        //     console.log('join');
        //     this.socket.emit("enter", this.name);
        //   },
        //   [SystemConstants.SPECTATE]: () => {

        //   }
        // }
        // choseCases[data.optionChosen]();
        // this.socket.emit("enter", this.name);
      });
      // askUsername((data: any) => {
      //   this.socket.emit("enter", data.username);
      // });
    });

  }

  checkExistsUser() {
    this.socket.on(SystemConstants.UNAME_EXISTS_KEY, (msg) => {
      print(msg);
      askUsername((data: { username: any; }) => {
        this.socket.emit(SystemConstants.ENTER_KEY, data.username);
      });
    });
  }

  playingProgressBoard() {
    this.socket.on(SystemConstants.PROGRESS_KEY, (msg) => {
      drawBoard(msg.split("|"), (move: any) => {
        this.socket.emit(SystemConstants.MOVE_KEY, move);
      });
    });
  }

  showMessages() {
    this.socket.on(SystemConstants.INFO_KEY, (msg) => {
      print(msg);
      clearPrint();
    });
  }

  checkGameIsOverOrNot() {
    this.socket.on(SystemConstants.OVER_KEY, (msg) => {
      showGameOver(msg);
    });
  }

  replayConfirm() {
    this.socket.on(SystemConstants.REPLAY_KEY, (msg) => {
      confirmReplay(msg, (value: any) => {
        this.socket.emit(SystemConstants.REPLAY_CONFIRM_KEY, value);
      });
    });
  }
  initializeScoreboard() {
    this.socket.on(SystemConstants.SCOREBOARD_KEY, (msg) => {
      const { total, X, O, tie } = JSON.parse(msg);
      printScoreboard(`[Total: ${total} | X: ${X} | O: ${O} | tie: ${tie}]`);
    });
  }

  disconnect() {
    this.socket.on(SystemConstants.DISCONNECT_KEY, () => {
      print(SystemConstants.DISCONNECT_MSG);
      process.exit();
    });
  }

  getRoomList() {
    this.socket.on(SystemConstants.ROOM_LIST, (rooms) => {
      const roomList = new Map(JSON.parse(rooms))
      print('rooooms');
    });
  }
}

const clientTest = new ClientTest();
export default clientTest;