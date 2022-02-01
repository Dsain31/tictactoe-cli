interface Player {
  id: string;
  username: string;
}
interface PlayerData {
  playerX: Player;
  playerO: Player;
}
export interface PlayerMap {
  playerX: Player;
  playerO: Player;
}