export const SystemConstants = {
  messages: {
    msg_tie: "Tied!",
    msg_win: "U Won!",
    msg_lose: "U Lost!",
    msg_resign: "The other player has resigned",
    msg_replay: "Play one more?",
    msg_game_0: "Game has not started yet!",
    msg_game_1: "Game started",
    msg_invalid: "Invalid move",
    msg_not_yet: "It's not your move yet.",
    msg_waiting: "Waiting for another player",
    msg_player_x: "You are 'Player X.",
    msg_player_o: "You are 'Player O.",
    msg_uname_exists: "Username already exists!",
  },
  STARTED: 1,
  TIED: 2,
  FINISHED: 3,
  normalize: (str = "") => str.replace(/[\s\n]/g, ""),
  genKey: () => Math.round(Math.random() * 1000).toString(),
  roomPrefix: "game_room_"
} as const;