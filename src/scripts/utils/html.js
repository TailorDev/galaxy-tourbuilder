export const createPanel = () => {
  const panel = document.createElement('div');

  panel.setAttribute('id', 'tour-configurator');
  panel.innerHTML = `
    <div class="actions">
      <button id="tour-toggle" title="Toggle the tour editor">
        Toggle
      </button>
      <button id="tour-reset" title="Start a new tour">
        Reset
      </button>
      <button id="tour-update" title="Save the YAML" class="primary">
        Save
      </button>
      <button id="tour-record" title="Record steps">
        Record
      </button>
      <button id="tour-run">Play</button>
    </div>
    <textarea wrap="off"></textarea>
  `;

  return panel;
};
