export const SystemConstants = {
  CONNECTION_MSG: 'Connected to the server. What would you like to do',
  INVALID_MSG: "Invalid option",
  OPTIONS_START: `
  1. Start New Game
  2. Join a game
  3. Spectate a game`,
  OPTIONS_JOIN: `
  2. Join a game
  3. Spectate a game`,
  URL: "http://localhost:3000",
  START: '1',
  JOIN: '2',
  SPECTATE: '3',
  CONNECT_KEY: 'connect',
  ENTER_KEY: "enter",
  JOIN_KEY: "enter-join",
  MOVE_KEY: "move",
  REPLAY_CONFIRM_KEY: "replayConfirm",
  DISCONNECT_KEY: "disconnect",
  UNAME_EXISTS_KEY: "uname-exists",
  PROGRESS_KEY: 'progress',
  OVER_KEY: "over",
  REPLAY_KEY: "replay",
  INFO_KEY: "info",
  SCOREBOARD_KEY: "scoreboard",
  DISCONNECT_MSG: "Disconnected!",
  TITLE: "Tic Tac Toe",
  ROOM_LIST: 'roomList'
} as const;