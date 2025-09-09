console.log('main.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded event fired');
  const { default: Program } = await import('./program.js');
  const program = new Program(document.body);
  program.run();
});