import Boreal from './boreal.js';

export default class ScreenHtml {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.rafId = null;
    this.root = this._render();
  }

  init() {
    this._loop();
  }

  term() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      console.log('ScreenHtml RAF loop ended');
    }
  }

  _loop() {
    this._work();
    this.rafId = requestAnimationFrame(() => this._loop());
  }

  _work() {
    if (this.timeLine) {
      this.timeLine.textContent = new Date().toISOString();
    }
  }

  _element(type, text = null) {
    const el = document.createElement(type);
    if (text !== null) {
      el.textContent = text;
    }
    this.root.appendChild(el);
    return el;
  }

  _render() {
    this.root = document.createElement('div');

    if (!this.params.nostyle) {
      this.boreal = new Boreal(this.root);
    }
    this.parent.appendChild(this.root);

    if (!this.params.demomode) {
      const homeButton = this._element('button', '< Home');
      homeButton.onclick = () => this.params.program.goto('main');
    }

    this._element('h1', 'html');

    this.timeLine = this._element('div');

    let jabberwock = [
      `Twas brillig, and the slithy toves
Did gyre and gimble in the wabe;
All mimsy were the borogoves,
And the mome raths outgrabe.`,
      `Beware the Jabberwock, my son!
The jaws that bite, the claws that catch!
Beware the Jubjub bird, and shun
The frumious Bandersnatch!`,
      `He took his vorpal sword in hand;
Long time the manxome foe he sought—
So rested he by the Tumtum tree,
And stood awhile in thought.`,
      `And, as in uffish thought he stood,
The Jabberwock, with eyes of flame,
Came whiffling through the tulgey wood,
And burbled as it came!`,
      `One, two! One, two! And through and through
The vorpal blade went snicker-snack!
He left it dead, and with its head
He went galumphing back.`,
      `And hast thou slain the Jabberwock?
Come to my arms, my beamish boy!
O frabjous day! Callooh! Callay!'
He chortled in his joy.`,
      `'Twas brillig, and the slithy toves
Did gyre and gimble in the wabe;
All mimsy were the borogoves,
And the mome raths outgrabe.`,
    ];
    this._element('h2', 'html');
    for (let line of jabberwock) {
      this._element('p', line);
    }

    let pooh = [
      `"Owl," said Christopher Robin, "I am going to give a party."`,
      `"You are, are you?" said Owl.`,
      `"And it's to be a special sort of party, because it's because of what Pooh did when he did what he did to save Piglet from the flood."`,
      `"Oh, that's what it's for, is it?" said Owl.`,
      `"Yes, so will you tell Pooh as quickly as you can, and all the others, because it will be to-morrow."`,
      `"Oh, it will, will it?" said Owl, still being as helpful as possible.`,
      `"So will you go and tell them, Owl?"`,
      `Owl tried to think of something very wise to say, but couldn't, so he flew off to tell the others. And the first person he told was Pooh.`,
      `"Pooh," he said, "Christopher Robin is giving a party."`,
      `"Oh!" said Pooh. And then seeing that Owl expected him to say something else, he said "Will there be those little cake things with pink sugar icing?"`,
      `Owl felt that it was rather beneath him to talk about little cake things with pink sugar icing, so he told Pooh exactly what Christopher Robin had said, and flew off to Eeyore.`,
    ];
    this._element('h2', 'Winnie-the-Pooh');
    for (let line of pooh) {
      this._element('p', line);
    }

    this._work();

    return this.root;
  }
}
