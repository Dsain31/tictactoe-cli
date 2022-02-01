import MultiplayerRoomController from "../controllers/multiplayer-room.controller";
import UserController from "../controllers/user.controller";
import { SystemConstants } from "../utils/constants/system.constants";
import { Socket, Server } from 'socket.io';
import Player from "./player";
import { PlayerMap } from "../interface/room.interface";
import CommonService from "../utils/services/common.service";

export default class App {
  io: Server;
  room: Map<any, any | PlayerMap>;
  userController: UserController;
  roomController: MultiplayerRoomController;
  constructor(socketIO: Server) {
    this.io = socketIO;
    this.room = new Map();
    this.userController = new UserController();
    this.roomController = new MultiplayerRoomController();
  }

  handleEnter(socket: any, username: string) {
    const exists = this.userController.checkExists(username);
    console.log('username', username);
    if (exists) {
      socket.emit("uname-exists", SystemConstants.messages.msg_uname_exists);
    } else {
      this.addToQueueWhenUserNotExist(socket, username);
    }

  }
  handlePlay(socket: Socket, message: string) {
    const normalized = SystemConstants.normalize(message);
    const roomID = this.room.get(socket.id);
    const game = this.roomController.getRoom(roomID);
    const currentPlayer = game.participants[socket.id];
    const move = Number(normalized);
    const playerTurn = game._turn === currentPlayer;
    // game has started, move is valid and is the player's turn
    if (playerTurn && game.status === SystemConstants.STARTED) {
      const accepted = game.makeMove(currentPlayer, move);
      if (accepted) {
        const progress = game.progress;
        this.io.to(roomID).emit("progress", progress);
        if (game.status === SystemConstants.FINISHED) {
          // game with decisive outcome
          socket.emit("over", SystemConstants.messages.msg_win);
          socket.broadcast.to(roomID).emit("over", SystemConstants.messages.msg_lose);
          this.io.to(roomID).emit("replay", SystemConstants.messages.msg_replay);
          game.updateScoreboard(currentPlayer);
          game.reset();
        } else if (game.status === SystemConstants.TIED) {
          // game has tied
          this.io.to(roomID).emit("over", SystemConstants.messages.msg_tie);
          this.io.to(roomID).emit("replay", SystemConstants.messages.msg_replay);
          game.updateScoreboard("tie");
          game.reset();
        } else {
          // toggle turns
          socket.broadcast.to(roomID).emit("progress", progress);
          game.toggleTurn();
        }
      }
    } else if (!playerTurn) {
      socket.emit("info", SystemConstants.messages.msg_not_yet);
    } else {
      socket.emit("info", SystemConstants.messages.msg_game_0);
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
        .emit("scoreboard", JSON.stringify(game.scoreboard));
      this.io.to(roomID).emit("info", SystemConstants.messages.msg_game_1);
      this.io.to(roomID).emit("progress", game.progress);
    }
  }
  handleDisconnect(socketID: any) {
    const roomID = this.room.get(socketID);
    // console.log('room', this.room);
    // console.log('roomid', roomID);
    this.room.delete(socketID);
    this.userController.remove(socketID);
    this.io.to(roomID).emit("info", SystemConstants.messages.msg_resign);
  }

  private addToQueueWhenUserNotExist(socket: Socket, username: string) {
    this.userController.add2Queue(socket, username);
    // if (this.userController.queueSize >= 2) {
    //   const players = this.userController.add2Store();
    //   this.matchTwoParticipateInGame(players);
    // } else {
    const player = this.userController.addOneStore();
    this.createRoomHandler(player);
      socket.emit("info", SystemConstants.messages.msg_waiting);
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
      .emit("info", `${SystemConstants.messages.msg_game_1} ${SystemConstants.messages.msg_player_x}`);
    this.io.to(pOSocketID)
      .emit("info", `${SystemConstants.messages.msg_game_1} ${SystemConstants.messages.msg_player_o}`);
    this.io.to(roomID)
      .emit("progress", newGame.progress);
    this.io.to(roomID)
      .emit("scoreboard", JSON.stringify(newGame.scoreboard));
  }

  handleJoin(socket: Socket, username: string, rooms: any) {
    console.log('this.room', this.room);
    this.userController.add2Queue(socket, username);
    if (this.userController.queueSize >= 2) {
      const players = this.userController.add2Store();
      this.joinRoomHandler(players, socket, rooms)
    }
  }

  private createRoomHandler(player: Player[]) {
    const [playerX, playerO] = player;
    const pXSocketID = playerX.socket.id;
    const roomID = this.roomController.generateRoomId();
    // players join the room
    playerX.socket.join(roomID);
    this.room.set(pXSocketID, roomID);
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
      playerX: { id: pXSocketID, username: pXUsername },
      playerO: { id: pOSocketID, username: pOUsername }
    });

    // player => room
    this.room.set(pOSocketID, roomID);
    console.log('this.room', this.room);
    this.io.to(pXSocketID)
      .emit("info", `${SystemConstants.messages.msg_game_1} ${SystemConstants.messages.msg_player_x}`);
    this.io.to(pOSocketID)
      .emit("info", `${SystemConstants.messages.msg_game_1} ${SystemConstants.messages.msg_player_o}`);
    this.io.to(roomID)
      .emit("progress", newGame.progress);
    this.io.to(roomID)
      .emit("scoreboard", JSON.stringify(newGame.scoreboard));
  }
}