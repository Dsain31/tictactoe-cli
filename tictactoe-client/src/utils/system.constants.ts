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
  SPECTATE: '3'
} as const;