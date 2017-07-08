/* @flow */

export const ACTIONS_HEIGHT = 35;

export const createPanel = () => {
  const panel = document.createElement('div');

  panel.setAttribute('id', 'galaxy-tourbuilder');
  panel.innerHTML = `
    <div class="actions">
      <button id="tour-toggle" title="Toggle the tour editor">
        Toggle
      </button>
      <button id="tour-new" title="Start a new tour">
        New
      </button>
      <button id="tour-save" title="Save the YAML" class="primary">
        Save
      </button>
      <button id="tour-export" title="Export the tour as a YAML file">
        Export
      </button>
      <button id="tour-record" title="Record steps">
        Record
      </button>
      <button id="tour-run">Play</button>
    </div>
    <div class="resizable-panel">
      <div class="resizable-panel-grip"></div>
      <textarea wrap="off"></textarea>
      <div id="galaxy-tourbuilder-status"></div>
    </div>
  `;

  return panel;
};

export const getEditor = ($configurator: HTMLElement | null): ?HTMLTextAreaElement => {
  if (!$configurator) {
    return null;
  }

  return (($configurator.querySelector('textarea'): any): ?HTMLTextAreaElement);
};

export const getStatus = ($configurator: HTMLElement | null): ?HTMLElement => {
  if (!$configurator) {
    return null;
  }

  return $configurator.querySelector('#galaxy-tourbuilder-status');
};
