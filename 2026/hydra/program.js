import Energy from './energy/Energy.js';
import SimpleBox200 from './energyexample/actor/simplebox200.js';
import CanvasInfo from './energyexample/actor/canvasinfo.js';

export default class Program {
  constructor(root = document.body) {
    this.root = root;
    this.on = false;
    this.energy = Energy.create();

    const energy = this.energy;
    this.energy.tree.addActor({draw(ctx) {
      ctx.fillStyle = '#def';
      ctx.fillRect(0, 0, energy.canvas.width, energy.canvas.height);
    } });

    this.energy.tree.addActor(new SimpleBox200());
    this.energy.tree.addActor(new CanvasInfo(this.energy.canvas));

  }

  run() {
    document.title = 'hydra';
    this.energy.run();
  }
}
