export const createPanel = () => {
  const panel = document.createElement('div');

  panel.setAttribute('id', 'tour-configurator');
  panel.innerHTML = `
    <div class="actions">
      <button id="tour-toggle">toggle</button>
      <button id="tour-update">update</button>
      <button id="tour-run">Play ►</button>
    </div>
    <textarea></textarea>
  `;

  return panel;
};
