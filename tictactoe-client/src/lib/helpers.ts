import blessed from 'blessed';
import figlet from "figlet";

export class Helpers {
  screen: any;
  title: any;
  warning: any;
  boardLayout: any;
  boxes: any;
  scoreboard: any;
  gameOver: any;
  blessed: typeof blessed;
  constructor() {
    this.blessed = blessed;
    // Create a screen object.
    this.screen = this.blessed.screen({
      smartCSR: true,
    });
    this.screen.title = "Tic Tac Toe";
    // Quit on Escape, q, or Control-C.
    this.screen.key(["escape", "q", "C-c"], function (ch: any, key: any) {
      return process.exit(0);
    });
    this.title = this.blessed.text({
      parent: screen as any,
      align: "center",
      content: figlet.textSync("Tic-Tac-Toe", {
        horizontalLayout: "full"
      }),
      style: {
        fg: "blue",
      },
    });
    this.warning = this.blessed.text({
      parent: screen as any,
      bottom: 0,
      left: "center",
      align: "center",
      style: {
        fg: "yellow",
      },
    });
    this.boardLayout = this.blessed.layout({
      parent: screen,
      top: "center",
      left: "center",
      // border: "line",
      width: "50%",
      height: "50%",
      renderer: function (coords: { xi: any; }) {
        const self = this;
        // The coordinates of the layout element
        const xi = coords.xi;
        // The current row offset in cells (which row are we on?)
        let rowOffset = 0;
        // The index of the first child in the row
        let rowIndex = 0;
        return function iterator(el: any, i: number) {
          el.shrink = true;
          const last = self.getLastCoords(i);
          if (!last) {
            el.position.left = "25%";
            el.position.top = 0;
          } else {
            el.position.left = last.xl - xi;
            if (i % 3 === 0) {
              rowOffset += self.children!
                .slice(rowIndex, i)
                .reduce(function (out: any, el: any) {
                  if (!self.isRendered(el)) return out;
                  out = Math.max(out, el.lpos.yl - el.lpos.yi);
                  return out;
                }, 0);
              rowIndex = i;
              el.position.left = "25%";
              el.position.top = rowOffset;
            } else {
              el.position.top = rowOffset;
            }
          }
        };
      },
    } as any);
    this.boxes = Array.from(Array(9).keys()).map(() => {
      const box = this.blessed.box({
        parent: this.boardLayout,
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
    this.scoreboard = this.blessed.text({
      parent: screen as any,
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
    this.gameOver = this.blessed.text({
      parent: screen as any,
      align: "center",
      left: "center",
      bottom: 0,
      hidden: true,
      style: {
        fg: "cyan",
      },
    });
  }

  printScoreboard(scores: string) {
    this.scoreboard.setContent(scores);
    this.scoreboard.show();
    this.screen.render();
  }
  hideBoard() {
    this.boxes.forEach((box: { hide: () => void; }) => {
      box.hide();
    });
    this.screen.render();
  }
  drawBoard(progress: any[], callback: (arg0: string) => void) {
    this.boxes.forEach((box: { setContent: (arg0: string) => void; show: () => void; on: (arg0: string, arg1: () => void) => void; }, i: number) => {
      box.setContent(`${progress[i] || "."}`);
      box.show();
      box.on("click", () => {
        callback(`${i + 1}`);
      });
    });
    this.screen.render();
  }
  print(msg: string) {
    this.warning.setContent(msg);
    this.screen.render();
  }
  clearPrint() {
    setTimeout(() => this.print(""), 4000);
  }
  confirmReplay(msg: string, callback: (arg0: string) => void) {
    const confirm = this.blessed.question({
      parent: this.screen,
      top: "center",
      left: "center",
      border: "line",
    });
    confirm.ask(msg, (err, value) => {
      if (!err) {
        callback(value);
        this.hideBoard();
        this.gameOver.hide();
      }
    });
    this.screen.render();
  }
  askUsername(callback: (arg0: any) => void) {
    const form = this.blessed.form({
      parent: this.screen,
      top: "center",
      left: "center",
    });
    const question = this.blessed.textbox({
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
      this.hideBoard();
      this.screen.remove(form);
    });
    this.screen.render();
  }
  showGameOver(msg: string) {
    this.gameOver.setContent(figlet.textSync(msg));
    this.gameOver.show();
    this.screen.render();
  }
}


