import blessed from 'blessed';
import figlet from "figlet";
// Create a screen object.

class BlessedClient {
  private screen!: blessed.Widgets.Screen;
  title: blessed.Widgets.TextElement;
  warning: blessed.Widgets.TextElement;
  boardLayout: blessed.Widgets.LayoutElement;
  boxes: blessed.Widgets.BoxElement[];
  scoreboard: blessed.Widgets.TextElement;
  gameOver: blessed.Widgets.TextElement;
  form!: blessed.Widgets.FormElement<any>;
  question!: blessed.Widgets.TextboxElement;
  constructor() {
    this.screen = blessed.screen({ smartCSR: true });
    this.screen.title = "Tic Tac Toe";
    // Quit on Escape, q, or Control-C.
    this.screen.key(["escape", "q", "C-c"], function (ch, key) {
      return process.exit(0);
    });

    this.title = blessed.text({
      parent: screen as any,
      align: "center",
      content: figlet.textSync("Tic-Tac-Toe", {
        horizontalLayout: "full"
      }),
      style: {
        fg: "blue",
      },
    });
    this.warning = blessed.text({
      parent: screen as any,
      bottom: 0,
      left: "center",
      align: "center",
      style: {
        fg: "yellow",
      },
    });

    this.boardLayout = blessed.layout({
      parent: screen as any,
      top: "center",
      left: "center",
      border: "line",
      width: "50%",
      height: "50%",
      layout: "grid",
      // renderer: (coords: any) => {
      //   console.log('cords', coords)
      //   let self: any = this;
      //   // The coordinates of the layout element
      //   const xi = coords.xi;
      //   // The current row offset in cells (which row are we on?)
      //   let rowOffset = 0;
      //   // The index of the first child in the row
      //   let rowIndex = 0;
      //   return (el: any, i: any) => {
      //     el.shrink = true;
      //     const last = self.getLastCoords(i);
      //     if (!last) {
      //       el.position.left = "25%";
      //       el.position.top = 0;
      //     } else {
      //       el.position.left = last.xl - xi;
      //       if (i % 3 === 0) {
      //         rowOffset += self.children
      //           .slice(rowIndex, i)
      //           .reduce(function (out: any, el: any) {
      //             if (!self.isRendered(el)) return out;
      //             out = Math.max(out, el.lops.yl - el.lops.yi);
      //             out;
      //           }, 0);
      //         rowIndex = i;
      //         el.position.left = "25%";
      //         el.position.top = rowOffset;
      //       } else {
      //         el.position.top = rowOffset;
      //       }
      //     }
      //   };
      // },
    });

    this.boxes = Array.from(Array(9).keys()).map(() => {
      const box = blessed.box({
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

    this.scoreboard = blessed.text({
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
    this.gameOver = blessed.text({
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
    this.boxes.forEach((box) => {
      box.hide();
    });
    this.screen.render();
  }
  drawBoard(progress: any[], callback: (arg0: string) => void) {
    this.boxes.forEach((box, i) => {
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
    const confirm = blessed.question({
      parent: screen as any,
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
    console.log('arg0')
    this.form = blessed.form({
      parent: screen as any,
      top: "center",
      left: "center",
    });
    this.question = blessed.textbox({
      parent: this.form,
      height: 3,
      name: "username",
      border: "line",
      style: {
        border: {
          fg: "green",
        },
      },
    });
    this.question.readInput();
    this.question.onceKey("enter", () => {
      this.form.submit();
    });
    this.form.on("submit", (data) => {
      // callback(data);
      this.hideBoard();
      this.screen.remove(this.form);
    });
    this.screen.render();
  }

  showGameOver(msg: any) {
    this.gameOver.setContent(figlet.textSync(msg));
    this.gameOver.show();
    this.screen.render();
  }

}

const blessedCli = new BlessedClient();
export default blessedCli;
