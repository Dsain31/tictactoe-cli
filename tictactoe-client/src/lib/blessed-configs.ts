import blessed from 'blessed';
import figlet from "figlet";

const screen = blessed.screen({
  smartCSR: true,
});
screen.title = "Tic Tac Toe";
// Quit on Escape, q, or Control-C.
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});
const title = blessed.text({
  parent: screen,
  align: "center",
  // content: figlet.textSync("Tic-Tac-Toe", {
  //   horizontalLayout: "default"
  // }),
  style: {
    fg: "blue",
  },
});
const warning = blessed.text({
  parent: screen,
  bottom: 0,
  left: "center",
  align: "center",
  style: {
    fg: "yellow",
  },
});
const boardLayout = blessed.layout({
  parent: screen,
  top: '10',
  left: "center",
  width: "50%",
  height: "50%",
  renderer: function (coords: { xi: any; }) {
    const self = this;
    // The coordinates of the layout element
    // xi means left side of a rendered element.
    const leftSideOfRenderedElemCoords = coords.xi;
    // The current row offset in cells (which row are we on?)
    let currentRowOffsetInCells = 0;
    // The index of the first child in the row
    let indexOfTheFirstChildInRow = 0;
    return function iterator(el: { shrink: boolean; position: { left: string | number; top: number; }; }, i: number) {
      // Make our children shrinkable. If they don't have a height, for
      // example, calculate it for them.
      el.shrink = true;
      // Find the previous rendered child's coordinates
      const previousRenderedChildCoords = self.getLastCoords(i);
      // If there is no previously rendered element, we are on the first child.
      if (!previousRenderedChildCoords) {
        el.position.left = "25%";
        el.position.top = 0;
      } else {
        // Otherwise, figure out where to place this child. We'll start by
        // setting it's `left`/`x` coordinate to right after the previous
        // rendered element. This child will end up directly to the right of it.
        el.position.left = previousRenderedChildCoords.xl - leftSideOfRenderedElemCoords;
        // If our child does not overlap the right side of the Layout, set it's
        // `top`/`y` to the current `rowOffset` (the coordinate for the current
        // row).
        if (i % 3 === 0) {
          // Otherwise we need to start a new row and calculate a new
          // `rowOffset` and `rowIndex` (the index of the child on the current
          // row).
          currentRowOffsetInCells += self.children
            .slice(indexOfTheFirstChildInRow, i)
            .reduce(function (out: number, el: { lpos: { yl: number; yi: number; }; }) {
              if (!self.isRendered(el)) return out;
              out = Math.max(out, el.lpos.yl - el.lpos.yi);
              return out;
            }, 0);
          indexOfTheFirstChildInRow = i;
          el.position.left = "25%";
          el.position.top = currentRowOffsetInCells;
        } else {
          el.position.top = currentRowOffsetInCells;
        }
      }
    };
  },
} as any);
const boxes = Array.from(Array(9).keys()).map(() => {
  const box = blessed.box({
    parent: boardLayout,
    width: 10,
    height: 5,
    border: "line",
    clickable: true,
    hidden: true,
    style: {
      hover: {
        bg: "green",
      },
      visible: false,
      border: {
        fg: "white",
      },
    },
  });
  return box;
});
const scoreboard = blessed.text({
  parent: screen,
  top: 6,
  left: "center",
  border: "line",
  clickable: false,
  hidden: true,
  style: {
    visible: false,
    border: {
      fg: "cyan",
    },
  },
});
const gameOver = blessed.text({
  parent: screen,
  align: "center",
  left: "center",
  bottom: 0,
  hidden: true,
  style: {
    fg: "cyan",
  },
});
function printScoreboard(scores: string) {
  scoreboard.setContent(scores);
  scoreboard.show();
  screen.render();
}
function hideBoard() {
  boxes.forEach((box) => {
    box.hide();
  });
  screen.render();
}
function drawBoard(progress: any[], callback: (arg0: string) => void) {
  boxes.forEach((box, i) => {
    box.setContent(`${progress[i] || "."}`);
    box.show();
    box.on("click", () => {
      callback(`${i + 1}`);
    });
  });
  screen.render();
}
function print(msg: string) {
  warning.setContent(msg);
  screen.render();
}
function clearPrint() {
  setTimeout(() => print(""), 4000);
}
function confirmReplay(msg: string, callback: (arg0: string) => void) {
  const confirm = blessed.question({
    parent: screen,
    top: "center",
    left: "center",
    border: "line",
  });
  confirm.ask(msg, (err, value) => {
    if (!err) {
      callback(value);
      hideBoard();
      gameOver.hide();
    }
  });
  screen.render();
}
function askUsername(callback: (arg0: any) => void) {
  const form = blessed.form({
    parent: screen,
    top: "center",
    left: "center",
  });
  const question = blessed.textbox({
    parent: form,
    height: 3,
    name: "username",
    border: "line",
    style: {
      border: {
        fg: "green",
      },
    },
  });
  question.readInput();
  question.onceKey("enter", () => {
    form.submit();
  });
  form.on("submit", (data) => {
    callback(data);
    hideBoard();
    screen.remove(form);
  });
  screen.render();
}
function showGameOver(msg: string) {
  gameOver.setContent(figlet.textSync(msg));
  gameOver.show();
  screen.render();
}

function topHeaderText(scores: string) {
  const testOptions = blessed.text({
    parent: screen,
    top: 8,
    clickable: false,
    style: {
      visible: true,
      border: {
        fg: "cyan",
      },
    },
  });
  testOptions.setContent(scores);
  testOptions.show();
  screen.render();
}

function promptOption(callback: (arg0: any) => void) {
  const form = blessed.form({
    parent: screen,
    top: "center",
    left: "center",
  });
  const question = blessed.textbox({
    parent: form,
    height: 3,
    name: "optionChosen",
    border: "line",
    clickable: true,
    style: {
      border: {
        fg: "green",
      },
    },
  });
  question.readInput();
  question.onceKey("enter", () => {
    form.submit();
  });
  form.on("submit", (data) => {
    callback(data);
    hideBoard();
    screen.remove(form);
  });
  screen.render();
}
export {
  print,
  drawBoard,
  clearPrint,
  askUsername,
  confirmReplay,
  printScoreboard,
  showGameOver,
  topHeaderText,
  promptOption
};