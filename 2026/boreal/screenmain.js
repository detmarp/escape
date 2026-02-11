import Boreal from './boreal.js';

export default class ScreenMain {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.root = this._render(params.goto);
    this.parent.appendChild(this.root);
  }

  _panel(label, onClick) {
    const panel = document.createElement('div');
    panel.style.width = '400px';
    panel.style.maxWidth = '95vw';
    panel.style.height = '100px';
    panel.style.border = '1px solid #bbb';
    panel.style.background = '#fafafa';
    panel.textContent = label;
    if (onClick) panel.onclick = onClick;
    return panel;
  }

  _render(goto) {
    const root = document.createElement('div');
    new Boreal(root);

    root.style.textAlign = 'left';
    root.style.padding = '2em';
    root.style.boxSizing = 'border-box';

    root.appendChild(this._element('h1', 'Heading 1'));
    root.appendChild(this._element('h2', 'Heading 2'));

    root.appendChild(this._element('p', 'aaa'));
    root.appendChild(this._element('p', 'bbb'));
    root.appendChild(this._element('p', 'ccc'));

    let label1 = this._element(null, '');
    root.appendChild(label1);

    root.appendChild(this._button('Button 1', () => {
      label1.textContent = 'Button 1 clicked';
    }));
    root.appendChild(this._button('Button 2', () => {
      label1.textContent = 'Button 2 clicked';
    }));

    root.appendChild(this._panel('Go to DOM Screen', () => goto && goto('dom')));
    root.appendChild(this._panel('Go to Canvas Screen', () => goto && goto('canvas')));
    root.appendChild(this._panel('Go to 3D Screen', () => goto && goto('threed')));

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
    for (let line of jabberwock) {
      root.appendChild(this._element('p', line));
    }

    return root;
  }

  _element(type = 'div', text = null) {
    const el = document.createElement(type);
    if (text !== null) {
      el.textContent = text;
      el.style.whiteSpace = 'pre-wrap';
    }
    return el;
  }

  _button(label, onClick = null) {
    let button = this._element('button', label);
    if (onClick) button.onclick = onClick;
    return button;
  }
}