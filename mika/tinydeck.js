export default class TinyDeck {
  constructor() {
    this.cards = [
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


    this.map = new Map(this.cards.map(card => [card.short, card]));
  }
}