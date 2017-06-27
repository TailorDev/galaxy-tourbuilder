export const createPanel = () => {
  const panel = document.createElement('div');

  panel.setAttribute('id', 'tour-configurator');
  panel.innerHTML = `
    <div class="actions">
      <button id="tour-toggle" title="Toggle the tour editor">
        Toggle
      </button>
      <button id="tour-update" title="Save the YAML">
        Save
      </button>
      <button id="tour-run">Play ►</button>
    </div>
    <textarea></textarea>
  `;

  return panel;
};
