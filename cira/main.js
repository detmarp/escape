document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    run();
  });
});

async function run() {
  const { default: Program } = await import('./program.js');
  const program = new Program(document.body);
  program.run();
}
