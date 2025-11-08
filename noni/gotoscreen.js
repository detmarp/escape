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
      this.screen = screen;
      this.screen.run();
    }
  }

  update() {
    if (this.screen) {
      this.screen.update();
    }
  }
}
