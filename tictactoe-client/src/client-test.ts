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
  }

  initializeConnection() {
    this.socket.on("connect", () => {

      console.log(`${SystemConstants.CONNECTION_MSG} ${this.name} (Choose an option)`);
      console.log(this.socket.id);
      topHeaderText(SystemConstants.OPTIONS_START);
      // if (this.socket.id) {
      //   test(SystemConstants.OPTIONS_JOIN);
      // } else {
      // }

      promptOption((data: { optionChosen: any }) => {
        console.log(this.options.includes(data.optionChosen));
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
            this.socket.emit("enter", this.name);
          },
          [SystemConstants.JOIN]: () => {
            console.log('join');
            this.socket.emit("enter-join", this.name);
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
    this.socket.on("uname-exists", (msg) => {
      print(msg);
      askUsername((data: { username: any; }) => {
        this.socket.emit("enter", data.username);
      });
    });
  }

  playingProgressBoard() {
    this.socket.on("progress", (msg) => {
      drawBoard(msg.split("|"), (move: any) => {
        this.socket.emit("move", move);
      });
    });
  }

  showMessages() {
    this.socket.on("info", (msg) => {
      print(msg);
      clearPrint();
    });
  }

  checkGameIsOverOrNot() {
    this.socket.on("over", (msg) => {
      showGameOver(msg);
    });
  }

  replayConfirm() {
    this.socket.on("replay", (msg) => {
      confirmReplay(msg, (value: any) => {
        this.socket.emit("replayConfirm", value);
      });
    });
  }
  initializeScoreboard() {
    this.socket.on("scoreboard", (msg) => {
      const { total, X, O, tie } = JSON.parse(msg);
      printScoreboard(`[Total: ${total} | X: ${X} | O: ${O} | tie: ${tie}]`);
    });
  }

  disconnect() {
    this.socket.on("disconnect", () => {
      print("Disconnected!");
      process.exit();
    });
  }
}

const clientTest = new ClientTest();
export default clientTest;