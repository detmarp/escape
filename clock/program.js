import { Clock } from './clock.js'

export class Program {
  run() {
    const clock = new Clock(document.getElementById('clock'))
    clock.start()
  }
}
