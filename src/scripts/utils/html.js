export const createPanel = () => {
  const panel = document.createElement('div');

  panel.setAttribute('id', 'tour-configurator');
  panel.setAttribute(
    'style',
    'position: absolute; bottom: 28px; height: 200px; width: 100%; z-index: 1000'
  );

  panel.innerHTML = `
    <button id="tour-toggle">toggle</button>
    <button id="tour-update">update</button>
    <button id="tour-run">run</button>
    <textarea style="width: 100%; height: 100%;"></textarea>
  `;

  return panel;
};
