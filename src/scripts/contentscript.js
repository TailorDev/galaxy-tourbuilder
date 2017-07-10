/* @flow */
import interact from 'interactjs';
import { saveAs } from 'file-saver';
import tabOverride from 'taboverride';
import ext from './utils/ext';
import storage from './utils/storage';
import { path as getPath, toggleClass, toggleAttribute } from './utils/dom';
import { ACTION_ENABLE } from './actions';
import * as html from './utils/html';
import GalaxyTour from './GalaxyTour';

let currentTour = new GalaxyTour();
let recording = false;

export const syncEditorWithTour = (
  tour: GalaxyTour,
  $panel: HTMLElement
): Promise<GalaxyTour> => {
  return new Promise((res, rej) => {
    try {
      const $editor = html.getEditor($panel);
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

export const newTour = ($panel: HTMLElement): Promise<GalaxyTour> => {
  return syncEditorWithTour(new GalaxyTour(), $panel);
};

export const saveTour = (
  tour: GalaxyTour,
  $panel: HTMLElement
): Promise<GalaxyTour> => {
  return new Promise((res, rej) => {
    try {
      const $editor = html.getEditor($panel);
      if ($editor) {
        tour.fromYAML($editor.value);
      }

      res(tour);
    } catch (e) {
      rej(e);
    }
  }).then(tour => syncEditorWithTour(tour, $panel));
};

export const addStepToTour = (
  tour: GalaxyTour,
  path: string,
  placement: string,
  $panel: HTMLElement
): Promise<GalaxyTour> => {
  tour.addStep(path, placement);

  return syncEditorWithTour(tour, $panel);
};

export const updateStatus = (message: string, $panel: HTMLElement) => {
  const $status = html.getStatus($panel);
  if (!$status) {
    return;
  }

  $status.innerHTML = message;
};

const clearStatus = ($panel: HTMLElement) => updateStatus('', $panel);

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
          if (typeof v === 'string' && v.indexOf('(function ()') >= 0) {
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

export const onClick: EventListener = (event: Event) => {
  const $panel = html.getPanel();
  if (!$panel) {
    return;
  }

  if (event.target.id === html.BTN_TOGGLE) {
    toggleClass($panel, 'hidden');
    return;
  }

  if (event.target.id === html.BTN_NEW) {
    return newTour($panel)
      .then(newTour => {
        clearStatus($panel);
        currentTour = newTour;
      })
      .catch(e => updateStatus(`Error: ${e.message || e}`, $panel));
  }

  if (event.target.id === html.BTN_SAVE) {
    const $btn = $panel.querySelector(html.BTN_SAVE);
    toggleAttribute($btn, 'disabled');

    return saveTour(currentTour, $panel)
      .then(() => clearStatus($panel))
      .catch(e => updateStatus(`Error: ${e.message || e}`, $panel))
      .then(() => toggleAttribute($btn, 'disabled'));
  }

  if (event.target.id === html.BTN_RECORD) {
    toggleClass($panel, 'recording');
    [html.BTN_PLAY, html.BTN_EXPORT, html.BTN_NEW].forEach(button => {
      toggleAttribute($panel.querySelector(`#${button}`), 'disabled');
    });
    recording = !recording;
    return;
  }

  if (event.target.id === html.BTN_EXPORT) {
    saveAs(
      new Blob([currentTour.toYAML()], { type: 'text/vnd.yaml;charset=utf-8' }),
      `${currentTour.getId()}.yaml`
    );
    return;
  }

  if (event.target.id === html.BTN_PLAY) {
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

  return addStepToTour(currentTour, path, placement, $panel)
    .then(updatedTour => (currentTour = updatedTour))
    .then(() => clearStatus($panel))
    .catch(e => updateStatus(`Error: ${e.message || e}`, $panel));
};

ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === ACTION_ENABLE) {
    let $panel = html.getPanel();

    if (request.value === true) {
      storage.get('tour', res => {
        if (res.tour) {
          currentTour.fromYAML(res.tour);
        }

        if (!$panel) {
          document.body && document.body.appendChild(html.createPanel());
          $panel = ((html.getPanel(): any): HTMLElement);

          interact('.resizable-panel', { context: $panel })
            .resizable({ edges: { top: true } })
            .on('resizestart', event => {
              event.target.disabled = true;
            })
            .on('resizemove', event => {
              const h = event.rect.height;
              if (
                h < html.ACTIONS_HEIGHT + 100 ||
                h > window.innerHeight - html.ACTIONS_HEIGHT
              ) {
                return;
              }

              event.target.style.height = `${h}px`;
              event.target.parentNode.style.height = `${h +
                html.ACTIONS_HEIGHT}px`;
            })
            .on('resizeend', event => {
              event.target.disabled = false;
              // force-stop for Firefox
              event.interaction.resizing = false;
            });

          const $editor = html.getEditor($panel);
          if ($editor) {
            tabOverride.tabSize(2).autoIndent(true).set($editor);
          }
        }

        const $editor = html.getEditor($panel);
        if ($editor) {
          $editor.value = currentTour.toYAML();
        }

        document.body && document.body.addEventListener('click', onClick);
      });
    } else {
      if ($panel) {
        $panel.parentNode && $panel.parentNode.removeChild($panel);
        document.body && document.body.removeEventListener('click', onClick);
      }
    }
  }
});
