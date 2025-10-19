import TinyBoard from './tinyboard.js';

export default class Tiny {
  constructor() {
    this.gameSeed = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    this.board = new TinyBoard(this);
  }

  static fromObject(obj = {}) {
    const instance = new Tiny();
    if (obj && typeof obj.gameSeed !== 'undefined' && obj.gameSeed !== null) {
      if (typeof obj.gameSeed === 'number') {
        instance.gameSeed = obj.gameSeed;
      } else if (typeof obj.gameSeed === 'string' && /^\d+$/.test(obj.gameSeed)) {
        instance.gameSeed = parseInt(obj.gameSeed, 10);
      }
    }
    return instance;
  }

  canPlace(position, color) {
    // return an array of legal placements, or null
    // position and color are optional, but if present will filter results
    return [
      { position: 0, color: 'red' },
    ];
  }

  getResources() {
    // returns array of placeable resources
    return [ 'wood', 'brick', 'wheat', 'stone', 'glass' ];
  }

  getHand() {
    return [
      {
        category: 'blue',
        name: 'Cottage',
        short: 'cott',
        shape: [
          '-y',
          'rc'
        ],
        score: {
          value: 3,
          condition: 'fed'
        },
        text: '3{coin} if this building is fed.',
      },
      {
        category: 'yellow',
        name: 'Theater',
        short: 'thtr',
        shape: [
          '-g-',
          'bcb'
        ],
        score: {
          value: 1,
          condition: 'unique-row-column'
        },
        text: '1{coin} for each other unique building type in the same row and column as {yellow}.',
      },
      {
        category: 'green',
        name: 'Tavern',
        short: 'tavrn',
        shape: [
          'rrc',
        ],
        score: {
          lookup: 'tavern'
        },
        text: '{coin} based on your constructed {green}.',
      },
      {
        category: 'orange',
        name: 'Chapel',
        short: 'chapl',
        shape: [
          '--c',
          'gcg'
        ],
        score: {
          value: 1,
          condition: 'fed-blue'
        },
        text: '1{coin} for each fed {blue}.',
      },
      {
        category: 'black',
        name: 'Factory',
        short: 'fact',
        shape: [
          'b---',
          'rggr',
        ],
        score: {
          value: 0,
        },
        text: 'When constructed, place 1 of the 5 resources on {black}. When another player names this resource, you may place a different resource instead.'
      },
      {
        category: 'red',
        name: 'Farm',
        short: 'farm',
        shape: [
          'yy',
          'bb',
        ],
        text: 'Feeds 4 {crop} buildings anywhere in your town.',
      },
      {
        category: 'gray',
        name: 'Well',
        short: 'well',
        shape: [
          'bg',
        ],
        score: {
          value: 1,
          condition: 'adjacent-blue'
        },
        text: '1{coin} for each adjacent {blue}.',
      },
      {
        name: "Architect's Guild",
        short: 'arch',
        category: 'pink',
        shape: [
          '--c',
          '-yg',
          'br-'
        ],
        max: 1,
        score: {
          value: 1
        },
        built: {
          action: 'replace',
          max: 2
        },
        text: '1{coin}. When constructed, replace up to 2 buildings in your town with any other building.'
      }
    ];
  }

  doResource(position, resource) {
    this.board.cells[position].resource = resource;
  }

  doCard(position, card) {
    this.board.cells[position].building = card;
  }

  toObject() {
    return {
      gameSeed: this.gameSeed,
    };
  }
}