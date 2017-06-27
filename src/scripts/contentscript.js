import ext from './utils/ext';
import { path as getPath, toggleClass } from './utils/dom';
import { ACTION_TOGGLE_RECORD } from './actions';
import { createPanel } from './utils/html';
import GalaxyTour from './tour';

let tour = new GalaxyTour();

document.querySelector('body').addEventListener('click', event => {
  const $configurator = document.querySelector('#tour-configurator');

  if ('tour-toggle' === event.target.id) {
    toggleClass($configurator, 'hidden');
    return;
  }

  if ('tour-update' === event.target.id) {
    tour.fromYAML($configurator.querySelector('textarea').value);
    return;
  }

  if ('tour-run' === event.target.id) {
    const script = document.createElement('script');
    const jsonSteps = JSON.stringify(tour.getSteps(), (k, v) => {
      if (typeof v === 'function') {
        return `(${v})`;
      }
      return v;
    });

    script.textContent = `
    (function (window, $) {
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
    })(window, jQuery);
    `;

    (document.head || document.documentElement).appendChild(script);
    script.remove();

    return;
  }

  const path = getPath(event.target, document.origin);

  if (
    path === '' ||
    /(tour-configurator|popover-|tour-|uid)/.test(path) ||
    // exclude menu sections
    /title_/.test(path)
  ) {
    return;
  }

  tour.addStep(path);
  $configurator.querySelector('textarea').value = tour.toYAML();
});

ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let $configurator = document.querySelector('#tour-configurator');

  if (request.action === ACTION_TOGGLE_RECORD) {
    if (request.value === true) {
      if (!$configurator) {
        document.body.appendChild(createPanel());
        $configurator = document.querySelector('#tour-configurator');
      }

      $configurator.querySelector('textarea').value = tour.toYAML();
    }
  }
});
