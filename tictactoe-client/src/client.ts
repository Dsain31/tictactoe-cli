import io, { Socket } from 'socket.io-client';
import {
  print,
  drawBoard,
  clearPrint,
  confirmReplay,
  askUsername,
  printScoreboard,
  showGameOver
} from './lib/blessed-configs';
import CommonService from './utils/common.service';
import { SystemConstants } from './utils/system.constants';
class ClientTest {
  address: string;
  name: string;
  socket: Socket;
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
      CommonService.startNewGameHandler(this.socket, this.name);
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
      CommonService.joinRoomHandler(this.socket, rooms, this.name);
    });
  }
}

const clientTest = new ClientTest();
export default clientTest;