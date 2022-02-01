import { SystemConstants } from "../utils/constants/system.constants";
import CommonService from "../utils/services/common.service";

export default class Game {
  gameID: any;
  board: Map<any, any>;
  moves: any;
  scoreboard: any;
  _status: number;
  _turn: string;
  participants: { [x: number]: string; };
  replayConfirmed: number;
  constructor(gameID: any, [pX, pO]: any) {
    this.gameID = gameID;
    this.board = new Map();
    this.moves = {
      X: [],
      O: [],
    };
    this.scoreboard = {
      total: 0,
      X: 0,
      O: 0,
      tie: 0,
    };
    this._status = 0;
    this._turn = "X";
    this.participants = {
      [pX]: "X",
      [pO]: "O",
    };
    this.replayConfirmed = 0;
  }
  /*
   * For starting the game
   */
  init() {
    this._status = SystemConstants.STARTED;
    this._turn = "X";
    this.replayConfirmed = 0;
    // fill the board
    Array.from(Array(9).keys()).forEach((c) => this.board.set(c + 1, null));
  }

  // get status of the game
  get status() {
    if (CommonService.checkWin(this.moves, this._turn)) {
      this._status = SystemConstants.FINISHED;
    } else if (CommonService.checkIsTied(this.progress)) {
      this._status = SystemConstants.TIED;
    }
    return this._status;
  }
  // show the board
  get progress() {
    return [...this.board.values()]
      .reduce((a, b) => `${a}${b || '.'}|`, '');
  }

  // toggle turn
  toggleTurn() {
    this._turn = this._turn === "X" ? "O" : "X";
  }
  confirmReplay() {
    this.replayConfirmed = 1;
  }
  /*
   * For tracking the participants' moves
   * @param playerMark string
   * @param tileNumber number
   */
  makeMove(playerMark: string, tileNumber: number) {
    if (this.board.get(tileNumber)) {
      return false;
    }
    this.moves[playerMark].push(tileNumber);
    this.board.set(tileNumber, playerMark);
    return true;
  }
  reset() {
    this.board.clear();
    this.moves = {
      X: [],
      O: [],
    };
    this._status = 0;
  }
  updateScoreboard(winner: string | number) {
    this.scoreboard = {
      ...this.scoreboard,
      total: this.scoreboard.total + 1,
      [winner]: this.scoreboard[winner] + 1,
    };
  }
}