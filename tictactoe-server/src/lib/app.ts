import MultiplayerRoomController from "../controllers/multiplayer-room.controller";
import UserController from "../controllers/user.controller";
import { SystemConstants } from "../utils/constants/system.constants";
import { Socket, Server } from 'socket.io';
import Player from "./player";
import { PlayerMap } from "../interface/room.interface";
import CommonService from "../utils/services/common.service";
import Game from "./game";

export default class App {
  io: Server;
  room: Map<any, any | PlayerMap>;
  userController: UserController;
  roomController: MultiplayerRoomController;
  roomListData: Map<any, any | PlayerMap>;
  constructor(socketIO: Server) {
    this.io = socketIO;
    this.room = new Map();
    this.roomListData = new Map();
    this.userController = new UserController();
    this.roomController = new MultiplayerRoomController();
  }

  handleEnter(socket: Socket, username: string) {
    if (this.roomListData.size < SystemConstants.ROOM_LIMIT) {
      const exists = this.userController.checkExists(username);
      if (exists) {
        socket.emit(SystemConstants.UNAME_EXISTS_KEY, SystemConstants.USERNAME_EXISTS_MSG);
      } else {
        this.addToQueueWhenUserNotExist(socket, username);
      }
    } else {
      socket.disconnect();
      socket.emit(SystemConstants.INFO_KEY, SystemConstants.ROOM_LIMIT_MSG);
    }

  }
  handlePlay(socket: Socket, message: string) {
    const normalized = SystemConstants.NORMALIZE(message);
    const roomID = this.room.get(socket.id);
    const game = this.roomController.getRoom(roomID);
    if (game && game.participants) {
    const currentPlayer = game.participants[socket.id];
    const move = Number(normalized);
    const playerTurn = game._turn === currentPlayer;
    // game has started, move is valid and is the player's turn
      if (playerTurn && game.status === SystemConstants.STARTED) {
        const accepted = game.makeMove(currentPlayer, move);
        if (accepted) {
          const progress = game.progress;
          this.io.to(roomID).emit(SystemConstants.PROGRESS_KEY, progress);
          if (game.status === SystemConstants.FINISHED) {
            // game with decisive outcome
            socket.emit(SystemConstants.OVER_KEY, SystemConstants.WIN_MSG);
            socket.broadcast.to(roomID).emit(SystemConstants.OVER_KEY, SystemConstants.LOST_MSG);
            this.io.to(roomID).emit(SystemConstants.REPLAY_KEY, SystemConstants.REPLAY_MSG);
            game.updateScoreboard(currentPlayer);
            game.reset();
          } else if (game.status === SystemConstants.TIED) {
            // game has tied
            this.io.to(roomID).emit(SystemConstants.OVER_KEY, SystemConstants.TIE_MSG);
            this.io.to(roomID).emit(SystemConstants.REPLAY_KEY, SystemConstants.REPLAY_MSG);
            game.updateScoreboard(SystemConstants.TIE_KEY);
            game.reset();
          } else {
            // toggle turns
            socket.broadcast.to(roomID).emit(SystemConstants.PROGRESS_KEY, progress);
            game.toggleTurn();
          }
        }
      } else if (!playerTurn) {
        socket.emit(SystemConstants.INFO_KEY, SystemConstants.NOT_MOVE_YET_MSG);
      } else {
        socket.emit(SystemConstants.INFO_KEY, SystemConstants.GAME_NOT_START_MSG);
      }
    } else {
      this.io.to(roomID).emit(SystemConstants.INFO_KEY, SystemConstants.LEFT_MSG);
    }
  }
  handleReplay(socket: any, confirmed: any) {
    const roomID = this.roomController.getCurrentRoomID(socket);
    const game = this.roomController.getRoom(roomID);
    if (!confirmed) {
      this.roomController.remove(roomID);
      socket.disconnect();
    } else if (game.replayConfirmed === 0) {
      game.confirmReplay();
    } else {
      game.reset();
      game.init();
      this.io.to(roomID)
        .emit(SystemConstants.SCOREBOARD_KEY, JSON.stringify(this.room));
      this.io.to(roomID).emit(SystemConstants.INFO_KEY, SystemConstants.GAME_START_MSG);
      this.io.to(roomID).emit(SystemConstants.PROGRESS_KEY, game.progress);
    }
  }
  handleDisconnect(socket: any) {
    const roomName = CommonService.getRoomName(socket.adapter);
    this.room.delete(socket.id);
    this.room.delete(roomName);
    this.userController.remove(socket);
    this.roomController.remove(roomName);
    socket.disconnect();
    this.io.to(roomName).emit(SystemConstants.INFO_KEY, SystemConstants.LEFT_MSG);
  }

  private addToQueueWhenUserNotExist(socket: Socket, username: string) {
    this.userController.add2Queue(socket, username);
    // if (this.userController.queueSize >= 2) {
    //   const players = this.userController.add2Store();
    //   this.matchTwoParticipateInGame(players);
    // } else {
    const player = this.userController.addOneStore();
    this.createRoomHandler(player);
    socket.emit(SystemConstants.INFO_KEY, SystemConstants.WAITING_MSG);
    // }
    // console.log('this.room', this.room);

  }

  private matchTwoParticipateInGame(players: Player[]) {
    const [playerX, playerO] = players;
    const pXSocketID = playerX.socket.id;
    const pXUsername = playerX.username;
    const pOSocketID = playerO.socket.id;
    const pOUsername = playerO.username;
    const newGame = this.roomController.create([pXSocketID, pOSocketID]);
    const roomID = newGame.gameID;
    newGame.init();
    // players join the room
    playerX.socket.join(roomID);
    playerO.socket.join(roomID);
    // roomID => players
    this.room.set(roomID, {
      playerX: { id: pXSocketID, username: pXUsername },
      playerO: { id: pOSocketID, username: pOUsername }
    });
    // player => room
    this.room.set(pXSocketID, roomID);
    this.room.set(pOSocketID, roomID);
    this.io.to(pXSocketID)
      .emit(SystemConstants.INFO_KEY, `${SystemConstants.GAME_START_MSG} ${SystemConstants.PLAYER_X_MSG}`);
    this.io.to(pOSocketID)
      .emit(SystemConstants.INFO_KEY, `${SystemConstants.GAME_START_MSG} ${SystemConstants.PLAYER_O_MSG}`);
    this.io.to(roomID)
      .emit(SystemConstants.PROGRESS_KEY, newGame.progress);
    this.io.to(roomID)
      .emit(SystemConstants.SCOREBOARD_KEY, JSON.stringify(newGame.scoreboard));
  }

  handleJoin(socket: Socket, username: string, rooms: any) {
    this.userController.add2Queue(socket, username);
    if (this.userController.queueSize >= 2) {
      const players = this.userController.add2Store();
      this.joinRoomHandler(players, socket, rooms)
    }
    const roomList = JSON.stringify(Array.from(this.roomListData.entries()));
    socket.emit(SystemConstants.ROOM_LIST, roomList);
  }

  private createRoomHandler(player: Player[]) {
    const [playerX, playerO] = player;
    const pXSocketID = playerX.socket.id;
    const pXUsername = playerX.username;
    const roomID = this.roomController.generateRoomId();
    // players join the room
    playerX.socket.join(roomID);
    this.room.set(roomID, {
      playerX: pXUsername,
    });
    this.room.set(pXSocketID, roomID);
    this.roomListData.set(roomID, {
      playerX: pXUsername,
    });
  }

  private joinRoomHandler(player: Player[], socket: any, rooms: any) {
    const [playerX, playerO] = player;
    const pXSocketID = playerX.socket.id;
    const pXUsername = playerX.username;
    const pOSocketID = playerO.socket.id;
    const pOUsername = playerO.username;
    const roomName = this.room.get(playerX.socket.id)
    const newGame = this.roomController.createRoom(roomName, [pXSocketID, pOSocketID]);
    const roomID = newGame.gameID;
    newGame.init();
    // players join the room
    playerX.socket.join(roomID);
    playerO.socket.join(roomID);
    // roomID => players
    this.room.set(roomID, {
      // playerX: { id: pXSocketID, username: pXUsername },
      // playerO: { id: pOSocketID, username: pOUsername },
      playerX: pXUsername,
      playerO: pOUsername
    });

    this.roomListData.set(roomID, {
      // playerX: { id: pXSocketID, username: pXUsername },
      // playerO: { id: pOSocketID, username: pOUsername },
      playerX: pXUsername,
      playerO: pOUsername
    });

    // player => room
    this.room.set(pOSocketID, roomID);
    this.io.to(pXSocketID)
      .emit(SystemConstants.INFO_KEY, `${SystemConstants.GAME_START_MSG} ${SystemConstants.PLAYER_X_MSG}`);
    this.io.to(pOSocketID)
      .emit(SystemConstants.INFO_KEY, `${SystemConstants.GAME_START_MSG} ${SystemConstants.PLAYER_O_MSG}`);
    this.io.to(roomID)
      .emit(SystemConstants.PROGRESS_KEY, newGame.progress);
    this.io.to(roomID)
      .emit(SystemConstants.SCOREBOARD_KEY, JSON.stringify(newGame.scoreboard));
  }

  getRoomList(socket?: Server) {
    // socket.emit(SystemConstants.ROOM_LIST, JSON.stringify(this.room));
    return this.room;
  }
}