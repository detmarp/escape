import Boreal from '../boreal/boreal.js';

const PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat lectus sed erat cursus, in ultrices eros scelerisque.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Duis at sem sit amet urna interdum gravida.',
  'Sed non sem ac neque blandit luctus. Nulla facilisi. Donec et nibh eget eros egestas faucibus.',
  'Mauris luctus, magna ac tincidunt lacinia, metus elit vestibulum nunc, ut feugiat turpis est in nulla.',
  'Aliquam erat volutpat. Morbi commodo, purus sit amet feugiat scelerisque, arcu lorem laoreet tortor, vitae tincidunt justo nibh ac nibh.',
  'Phasellus accumsan tellus sed libero dictum posuere. Donec porta arcu eget nisi ultricies finibus.',
  'Curabitur euismod leo vel velit feugiat, eget volutpat nunc feugiat. Quisque viverra metus a justo consectetur, quis aliquet odio facilisis.',
  'Aenean non mauris in est aliquam lacinia. In dignissim efficitur quam, et aliquet magna ultricies in.',
  'Donec eget tortor in mi aliquet sodales. Vivamus id massa et turpis porta dignissim.',
  'Praesent vulputate mi et purus consequat, a sagittis dolor porttitor. Cras id sem nec mauris fermentum ultricies.',
  'Nunc id odio in enim consequat volutpat. Suspendisse potenti. Pellentesque sit amet turpis a enim tempor viverra.',
  'Ut vehicula turpis et erat tincidunt, id dictum velit iaculis. Nunc id varius justo, a accumsan erat.',
  'Fusce ac justo nec velit lacinia aliquam. Quisque feugiat nibh at sem suscipit, in facilisis sem consequat.',
  'Integer ac nisi ac nibh feugiat cursus. Etiam suscipit lorem vitae turpis consequat, sed dictum augue blandit.',
  'Morbi nec mi a lorem convallis efficitur. Etiam posuere turpis vitae metus pellentesque, et feugiat lectus efficitur.',
  'Suspendisse placerat sem quis turpis tristique, vel cursus nunc malesuada. Sed at sapien vitae risus malesuada suscipit.',
  'Nam nec dui at felis ultricies fermentum. Cras varius velit non risus auctor, non ullamcorper urna volutpat.',
  'Etiam posuere orci ac libero euismod, et cursus augue congue. Vivamus malesuada mi vel mauris laoreet rhoncus.',
  'In eu turpis eget massa ultricies varius. Donec consequat leo non erat consectetur, vel suscipit risus volutpat.',
  'Quisque a orci nec lorem rutrum placerat. Donec auctor nibh ac augue pellentesque, id dapibus ipsum semper.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat lectus sed erat cursus, in ultrices eros scelerisque.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Duis at sem sit amet urna interdum gravida.',
  'Sed non sem ac neque blandit luctus. Nulla facilisi. Donec et nibh eget eros egestas faucibus.',
  'Mauris luctus, magna ac tincidunt lacinia, metus elit vestibulum nunc, ut feugiat turpis est in nulla.',
  'Aliquam erat volutpat. Morbi commodo, purus sit amet feugiat scelerisque, arcu lorem laoreet tortor, vitae tincidunt justo nibh ac nibh.',
  'Phasellus accumsan tellus sed libero dictum posuere. Donec porta arcu eget nisi ultricies finibus.',
  'Curabitur euismod leo vel velit feugiat, eget volutpat nunc feugiat. Quisque viverra metus a justo consectetur, quis aliquet odio facilisis.',
  'Aenean non mauris in est aliquam lacinia. In dignissim efficitur quam, et aliquet magna ultricies in.',
  'Donec eget tortor in mi aliquet sodales. Vivamus id massa et turpis porta dignissim.',
  'Praesent vulputate mi et purus consequat, a sagittis dolor porttitor. Cras id sem nec mauris fermentum ultricies.',
  'Nunc id odio in enim consequat volutpat. Suspendisse potenti. Pellentesque sit amet turpis a enim tempor viverra.',
  'Ut vehicula turpis et erat tincidunt, id dictum velit iaculis. Nunc id varius justo, a accumsan erat.',
  'Fusce ac justo nec velit lacinia aliquam. Quisque feugiat nibh at sem suscipit, in facilisis sem consequat.',
  'Integer ac nisi ac nibh feugiat cursus. Etiam suscipit lorem vitae turpis consequat, sed dictum augue blandit.',
  'Morbi nec mi a lorem convallis efficitur. Etiam posuere turpis vitae metus pellentesque, et feugiat lectus efficitur.',
  'Suspendisse placerat sem quis turpis tristique, vel cursus nunc malesuada. Sed at sapien vitae risus malesuada suscipit.',
  'Nam nec dui at felis ultricies fermentum. Cras varius velit non risus auctor, non ullamcorper urna volutpat.',
  'Etiam posuere orci ac libero euismod, et cursus augue congue. Vivamus malesuada mi vel mauris laoreet rhoncus.',
  'In eu turpis eget massa ultricies varius. Donec consequat leo non erat consectetur, vel suscipit risus volutpat.',
  'Quisque a orci nec lorem rutrum placerat. Donec auctor nibh ac augue pellentesque, id dapibus ipsum semper.',
];

export default class Program {
  constructor(root = document.body) {
    this.root = root;
  }

  run() {
    this.root.innerHTML = '';
    this.root.style.margin = '0';
    this.root.style.padding = '0';

    const page = document.createElement('main');
    page.style.minHeight = '100vh';
    page.style.boxSizing = 'border-box';
    page.style.touchAction = 'pan-y';

    this.root.appendChild(page);
    new Boreal(page, { scrollable: true });
    page.style.padding = '24px clamp(10px, 2.5vw, 20px) 48px';

    const title = document.createElement('h1');
    title.textContent = 'Freya';
    title.style.display = 'inline-block';
    page.appendChild(title);

    for (const text of PARAGRAPHS) {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      page.appendChild(paragraph);
    }
  }
}
