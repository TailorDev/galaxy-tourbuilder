/* @flow */
import interact from 'interactjs';
import { saveAs } from 'file-saver';
import tabOverride from 'taboverride';
import ext from './utils/ext';
import storage from './utils/storage';
import { path as getPath, toggleClass, toggleAttribute } from './utils/dom';
import { ACTION_ENABLE } from './actions';
import {
  createPanel,
  getEditor,
  getStatus,
  ACTIONS_HEIGHT,
} from './utils/html';
import GalaxyTour from './GalaxyTour';

let currentTour = new GalaxyTour();
let recording = false;

export const syncEditorWithTour = (
  tour: GalaxyTour,
  $configurator: HTMLElement
): Promise<GalaxyTour> => {
  return new Promise((res, rej) => {
    try {
      const $editor = getEditor($configurator);
      if ($editor) {
        $editor.value = tour.toYAML();
      }

      storage.set({ tour: tour.toYAML() }, () => {
        res(tour);
      });
    } catch (e) {
      rej(e);
    }
  });
};

export const newTour = ($configurator: HTMLElement): Promise<GalaxyTour> => {
  return syncEditorWithTour(new GalaxyTour(), $configurator);
};

export const saveTour = (
  tour: GalaxyTour,
  $configurator: HTMLElement
): Promise<GalaxyTour> => {
  return new Promise((res, rej) => {
    try {
      const $editor = getEditor($configurator);
      if ($editor) {
        tour.fromYAML($editor.value);
      }

      res(tour);
    } catch (e) {
      rej(e);
    }
  }).then(tour => syncEditorWithTour(tour, $configurator));
};

export const addStepToTour = (
  tour: GalaxyTour,
  path: string,
  placement: string,
  $configurator: HTMLElement
): Promise<GalaxyTour> => {
  tour.addStep(path, placement);

  return syncEditorWithTour(tour, $configurator);
};

export const updateStatus = (message: string, $configurator: HTMLElement) => {
  const $status = getStatus($configurator);
  if (!$status) {
    return;
  }

  $status.innerHTML = message;
};

const runTour = (tour: GalaxyTour) => {
  const script = document.createElement('script');
  const jsonSteps = JSON.stringify(tour.getStepsForInjection(), (k, v) => {
    if (typeof v === 'function') {
      return `(${v})`;
    }
    return v;
  });

  script.textContent = `
    (function (window, $) {
      if ($ === null || !window.Tour) {
        alert('It looks like you are not running the Galaxy Tour Builder extension into a Galaxy application, therefore the tour cannot be played.');
        return;
      }

      function parse(obj) {
        return JSON.parse(obj, (k, v) => {
          if (typeof v === 'string' && v.indexOf('function') >= 0) {
            return eval(v);
          }
          return v;
        });
      }

      var tour = new window.Tour({
        steps: parse(${JSON.stringify(jsonSteps)}),
      }, {
        orphan: true,
        delay: 150,
      });

      tour.init();
      tour.goTo(0);
      tour.restart();
    })(window, (typeof jQuery === 'undefined' ? null : jQuery));
    `;

  (document.head || document.documentElement || document).appendChild(script);
  script.remove();
};

const onClick: EventListener = (event: Event) => {
  const $configurator = document.querySelector('#galaxy-tourbuilder');
  if (!$configurator) {
    return;
  }

  if ('tour-toggle' === event.target.id) {
    toggleClass($configurator, 'hidden');
    return;
  }

  if ('tour-new' === event.target.id) {
    return newTour($configurator)
      .then(newTour => {
        updateStatus('', $configurator);
        currentTour = newTour;
      })
      .catch(e => updateStatus(`Error: ${e.message || e}`, $configurator));
  }

  if ('tour-save' === event.target.id) {
    const $btn = $configurator.querySelector('#tour-save');

    toggleAttribute($btn, 'disabled');
    return saveTour(currentTour, $configurator)
      .then(() => {
        updateStatus('', $configurator);
      })
      .catch(e => updateStatus(`Error: ${e.message || e}`, $configurator))
      .then(() => {
        toggleAttribute($btn, 'disabled');
      });
  }

  if ('tour-record' === event.target.id) {
    toggleClass($configurator, 'recording');
    ['run', 'export', 'new'].forEach(action => {
      toggleAttribute(
        $configurator.querySelector(`#tour-${action}`),
        'disabled'
      );
    });
    recording = !recording;
    return;
  }

  if ('tour-export' === event.target.id) {
    saveAs(
      new Blob([currentTour.toYAML()], { type: 'text/vnd.yaml;charset=utf-8' }),
      `${currentTour.getId()}.yaml`
    );
    return;
  }

  if ('tour-run' === event.target.id) {
    return runTour(currentTour);
  }

  const $target: HTMLElement = (event.target: any);
  const path = getPath($target, document.origin || '');

  if (
    !recording ||
    !path ||
    path === '' ||
    /(galaxy-tourbuilder|popover-|tour-|uid)/.test(path) ||
    // exclude menu sections
    /title_/.test(path)
  ) {
    return;
  }

  let placement = 'right';
  if (event instanceof MouseEvent && window.innerWidth / 2 < event.clientX) {
    placement = 'left';
  }

  return addStepToTour(currentTour, path, placement, $configurator)
    .then(updatedTour => {
      updateStatus('', $configurator);
      currentTour = updatedTour;
    })
    .catch(e => updateStatus(`Error: ${e.message || e}`, $configurator));
};

ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === ACTION_ENABLE) {
    let $configurator = document.querySelector('#galaxy-tourbuilder');

    if (request.value === true) {
      storage.get('tour', res => {
        if (res.tour) {
          currentTour.fromYAML(res.tour);
        }

        if (!$configurator) {
          document.body && document.body.appendChild(createPanel());
          $configurator = document.querySelector('#galaxy-tourbuilder');

          interact('.resizable-panel', { context: $configurator })
            .resizable({ edges: { top: true } })
            .on('resizestart', event => {
              event.target.disabled = true;
            })
            .on('resizemove', event => {
              const h = event.rect.height;
              if (
                h < ACTIONS_HEIGHT + 100 ||
                h > window.innerHeight - ACTIONS_HEIGHT
              ) {
                return;
              }

              event.target.style.height = `${h}px`;
              event.target.parentNode.style.height = `${h + ACTIONS_HEIGHT}px`;
            })
            .on('resizeend', event => {
              event.target.disabled = false;
              // force-stop for Firefox
              event.interaction.resizing = false;
            });

          const $editor = getEditor($configurator);
          if ($editor) {
            tabOverride.tabSize(2).autoIndent(true).set($editor);
          }
        }

        const $editor = getEditor($configurator);
        if ($editor) {
          $editor.value = currentTour.toYAML();
        }

        document.body && document.body.addEventListener('click', onClick);
      });
    } else {
      if ($configurator) {
        $configurator.parentNode &&
          $configurator.parentNode.removeChild($configurator);
        document.body && document.body.removeEventListener('click', onClick);
      }
    }
  }
});
