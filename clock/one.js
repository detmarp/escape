import { setupSubScreen } from './subscreen.js'

export class One {
  constructor(goto, screens, canvas = null) {
    this.canvas = canvas ?? setupSubScreen(goto)
  }

  draw(now) {}
}
