import io from 'socket.io-client';
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
import { SystemConstants } from './utils/system.constants';

const address = process.argv[2];
let hostName = "http://localhost:3000";
if (address && address.length > 0) {
  const splitHostAndPort = address.split(':');
  const ip = splitHostAndPort[0];
  const portNumber = splitHostAndPort[1];
  hostName = `http://${ip}:${portNumber}`;
}
const name = process.argv[3];
const socket = io(hostName);
socket.on("connect", () => {
  console.log(`${SystemConstants.CONNECTION_MSG} ${name} (Choose an option)`);
  topHeaderText(`1. Start New Game
  2. Join a game
  3. Spectate a game`)
  promptOption((data: { optionChosen: any }) => {
    console.log(['1', '2', '3'].includes(data.optionChosen));
    if (!['1', '2', '3'].includes(data.optionChosen)) {
      print("invalid option")
      clearPrint();
    }
    const choseCases: any = {
      [SystemConstants.START]: () => {
        console.log(name)
        socket.emit("enter", name)
      },
      [SystemConstants.JOIN]: () => {

      },
      [SystemConstants.SPECTATE]: () => {

      }
    }
    choseCases[data.optionChosen]();
    // socket.emit("connected", name);

  })
  // askUsername((data: any) => {
  //   socket.emit("enter", data.username);
  // });
});
socket.on("uname-exists", (msg) => {
  print(msg);
  askUsername((data: { username: any; }) => {
    socket.emit("enter", data.username);
  });
});
socket.on("progress", (msg) => {
  drawBoard(msg.split("|"), (move: any) => {
    socket.emit("move", move);
  });
});
socket.on("info", (msg) => {
  print(msg);
  clearPrint();
});
socket.on("over", (msg) => {
  showGameOver(msg);
});
socket.on("replay", (msg) => {
  confirmReplay(msg, (value: any) => {
    socket.emit("replayConfirm", value);
  });
});
socket.on("scoreboard", (msg) => {
  const { total, X, O, tie } = JSON.parse(msg);
  printScoreboard(`[Total: ${total} | X: ${X} | O: ${O} | tie: ${tie}]`);
});
socket.on("disconnect", () => {
  print("Disconnected 😞");
  process.exit();
});