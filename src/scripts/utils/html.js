/* @flow */

export const ACTIONS_HEIGHT = 35;
export const BTN_TOGGLE = 'tour-toggle';
export const BTN_NEW = 'tour-new';
export const BTN_SAVE = 'tour-save';
export const BTN_EXPORT = 'tour-export';
export const BTN_RECORD = 'tour-record';
export const BTN_PLAY = 'tour-play';

export const createPanel = () => {
  const panel = document.createElement('div');

  panel.setAttribute('id', 'galaxy-tourbuilder');
  panel.innerHTML = `
    <div class="actions">
      <button id="${BTN_TOGGLE}" title="Toggle this panel">
        Toggle
      </button>
      <button id="${BTN_NEW}" title="Start a new tour">
        New
      </button>
      <button id="${BTN_SAVE}" title="Save your changes" class="primary">
        Save
      </button>
      <button id="${BTN_EXPORT}" title="Export the current tour as a YAML file">
        Export
      </button>
      <button id="${BTN_RECORD}" title="Record new steps">
        Record
      </button>
      <button id="${BTN_PLAY}">
        Play
      </button>
    </div>
    <div class="resizable-panel">
      <div class="resizable-panel-grip"></div>
      <textarea wrap="off"></textarea>
      <div id="galaxy-tourbuilder-status"></div>
    </div>
  `;

  return panel;
};

export const getPanel = (): ?HTMLElement => {
  return document.querySelector('#galaxy-tourbuilder');
};

export const getEditor = (
  $configurator: HTMLElement | null
): ?HTMLTextAreaElement => {
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
