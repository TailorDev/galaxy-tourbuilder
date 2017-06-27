import cssPath from 'css-path';
import ext from './utils/ext';
import { ACTION_TOGGLE_RECORD } from './actions';
import { createPanel } from './utils/html';
import GalaxyTour from './tour';

let tour = new GalaxyTour();

document.querySelector('body').addEventListener('click', event => {
  const $configurator = document.querySelector('#tour-configurator');

  if ('tour-toggle' === event.target.id) {
    const h = getComputedStyle($configurator)['height'];
    $configurator.style.height = '0px' === h ? '200px' : '0px';

    return;
  }

  if ('tour-update' === event.target.id) {
    tour.fromYAML($configurator.querySelector('textarea').value);
    return;
  }

  if ('tour-run' === event.target.id) {
    const script = document.createElement('script');
    const name = `tour_${new Date().getTime()}`;

    script.textContent = `
    const ${name} = new window.Tour({
      steps: ${JSON.stringify(tour.getSteps())},
    });
    ${name}.init();
    ${name}.goTo(0);
    ${name}.restart();
    `;

    (document.head || document.documentElement).appendChild(script);
    script.remove();

    return;
  }

  const path = cssPath(event.target);

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
