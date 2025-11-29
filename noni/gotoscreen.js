import ScreenCredits from './screenscredits.js';
import ScreenEditor from './screeneditor.js';
import ScreenGame from './screengame.js';
import ScreenMain from './screenmain.js';
import ScreenPregame from './screenpregame.js';
import ScreenSettings from './screensettings.js';
import ScreenTest from './screentest.js';

export default class GoToScreen {
  constructor(program) {
    this.program = program;
  }

  to(name) {
    let screen;
    if (name === 'main') {
      screen = new ScreenMain(this.program);
    }
    else if (name === 'settings') {
      screen = new ScreenSettings(this.program);
    }
    else if (name === 'test') {
      screen = new ScreenTest(this.program);
    }
    else if (name === 'editor') {
      screen = new ScreenEditor(this.program);
    }
    else if (name === 'game') {
      screen = new ScreenGame(this.program);
    }
    else if (name === 'pregame') {
      screen = new ScreenPregame(this.program);
    }
    else if (name === 'credits') {
      screen = new ScreenCredits(this.program);
    }

    if (screen) {
      console.log(`eee 2 ${this.program.tiny && this.program.tiny.timeStamp} - goto ${name}`);
      this.program.container.onFinger = null;
      this.screen = screen;
      this.screen.run();
      if (this.screen.onFinger) {
        this.program.container.onFinger = (action, pos, pos2) => {
          this.screen.onFinger(action, pos, pos2);
        };
      }
    }
  }

  update() {
    if (this.screen && this.screen.update) {
      this.screen.update();
    }
  }

  work() {
    if (this.screen && this.screen.work) {
      this.screen.work();
    }
  }
}
