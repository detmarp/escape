import rules from './spacerules.js';
import Spaceport from './spaceport.js';

export default class SpaceSetup {
  constructor() {
  }

  makeSpaceport(now) {
    const setup = rules.setup.basic;
    const buildings = [];

    for (const bldgSetup of setup.buildings) {
      const buildingDef = rules.blueprints[bldgSetup.id];
      if (buildingDef) {
        buildings.push({
          id: bldgSetup.id,
          level: bldgSetup.level,
        });
      }
    }

    let port = new Spaceport();
    port.money = 100;
    port.buildings = [
      {
        type: 'hangar',
        level: 0,
        upgradeEnd: now + 60 * 1000,
      },
    ];
    return port;
  }
}
