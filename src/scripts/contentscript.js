import ext from './utils/ext';
import storage from './utils/storage';
import {
  path as getPath,
  toggleClass,
  toggleAttribute,
} from './utils/dom';
import { ACTION_ENABLE } from './actions';
import { createPanel } from './utils/html';
import GalaxyTour from './tour';

let currentTour = new GalaxyTour();
let recording = false;

const newTour = ($configurator) => {
  return new Promise((res, rej) => {
    const tour = new GalaxyTour();

    storage.set({ tour: tour.toYAML() }, () => {
      $configurator.querySelector('textarea').value = tour.toYAML();
      res(tour);
    });
  });
};

const saveTour = (tour, $configurator) => {
  return new Promise((res, rej) => {
    tour.fromYAML($configurator.querySelector('textarea').value);

    storage.set({ tour: tour.toYAML() }, res);
  });
};

const addStepToTour = (tour, path, $configurator) => {
  return new Promise((res, rej) => {
    tour.addStep(path);

    storage.set({ tour: tour.toYAML() }, () => {
      $configurator.querySelector('textarea').value = tour.toYAML();
      res(tour);
    });
  });
};

const runTour = (tour) => {
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

  (document.head || document.documentElement).appendChild(script);
  script.remove();
};

document.querySelector('body').addEventListener('click', event => {
  const $configurator = document.querySelector('#tour-configurator');

  if ('tour-toggle' === event.target.id) {
    toggleClass($configurator, 'hidden');
    return;
  }

  if ('tour-new' === event.target.id) {
    return newTour($configurator).then(newTour => {
      currentTour = newTour;
    });
  }

  if ('tour-save' === event.target.id) {
    return saveTour(currentTour, $configurator);
  }

  if ('tour-record' === event.target.id) {
    toggleClass($configurator, 'recording');
    toggleAttribute($configurator.querySelector('#tour-run'), 'disabled');
    recording = !recording;
    return;
  }

  if ('tour-run' === event.target.id) {
    return runTour(currentTour);
  }

  const path = getPath(event.target, document.origin);

  if (
    !recording ||
    path === '' ||
    /(tour-configurator|popover-|tour-|uid)/.test(path) ||
    // exclude menu sections
    /title_/.test(path)
  ) {
    return;
  }

  return addStepToTour(currentTour, path, $configurator)
    .then(updatedTour => {
      currentTour = updatedTour;
    });
});

ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let $configurator = document.querySelector('#tour-configurator');

  if (request.action === ACTION_ENABLE) {
    if (request.value === true) {
      storage.get('tour', res => {
        if (res.tour) {
          currentTour.fromYAML(res.tour);
        }

        if (!$configurator) {
          document.body.appendChild(createPanel());
          $configurator = document.querySelector('#tour-configurator');
        }

        $configurator.querySelector('textarea').value = currentTour.toYAML();
      });
    } else if ($configurator) {
      $configurator.parentNode.removeChild($configurator);
    }
  }
});
