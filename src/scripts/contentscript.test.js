import * as cs from './contentscript';
import GalaxyTour from './GalaxyTour';
import { getStatus } from './utils/html';

jest.mock('./utils/ext', () => {
  return {
    runtime: {
      onMessage: {
        addListener: jest.fn(),
      },
    },
  };
});

jest.mock('./utils/storage', () => {
  return {
    set: (data, cb) => cb(),
  };
});

describe('syncEditorWithTour()', () => {
  it('updates the content in the editor', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea></textarea></div>';

    const tour = new GalaxyTour();
    const $el = document.querySelector('#galaxy-tourbuilder');

    expect($el.querySelector('textarea').value).toEqual('');

    return cs.syncEditorWithTour(tour, $el).then(t => {
      expect(t).toBe(tour);
      expect($el.querySelector('textarea').value).toEqual(tour.toYAML());
    });
  });

  it('rejects the promise if error', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea></textarea></div>';

    const tour = new GalaxyTour();
    const $el = document.querySelector('#galaxy-tourbuilder');
    expect($el.querySelector('textarea').value).toEqual('');

    // force-throw an error
    tour.toYAML = () => {
      throw new Error('error message');
    };

    return cs.syncEditorWithTour(tour, $el).catch(e => {
      expect(e.message).toEqual('error message');
    });
  });
});

describe('newTour()', () => {
  it('creates a new tour and updates the editor accordingly', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea>id: foo</textarea></div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect($el.querySelector('textarea').value).toEqual('id: foo');

    return cs.newTour($el).then(t => {
      expect(t).toMatchObject(new GalaxyTour());
      expect($el.querySelector('textarea').value).toEqual(t.toYAML());
    });
  });
});

describe('saveTour()', () => {
  it('updates the tour using the content of the editor', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea>id: foo</textarea></div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect($el.querySelector('textarea').value).toEqual('id: foo');

    return cs.saveTour(new GalaxyTour(), $el).then(t => {
      expect(t.id).toBe('foo');
      expect($el.querySelector('textarea').value).toEqual(t.toYAML());
    });
  });

  it('rejects the promise if error', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea></textarea></div>';

    const tour = new GalaxyTour();
    const $el = document.querySelector('#galaxy-tourbuilder');
    expect($el.querySelector('textarea').value).toEqual('');

    // force-throw an error
    tour.fromYAML = () => {
      throw new Error('error message');
    };

    return cs.saveTour(tour, $el).catch(e => {
      expect(e.message).toEqual('error message');
    });
  });
});

describe('addStepToTour()', () => {
  it('updates the tour using the content of the editor', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea></textarea></div>';

    const tour = new GalaxyTour();
    const $el = document.querySelector('#galaxy-tourbuilder');
    expect($el.querySelector('textarea').value).toEqual('');

    expect(tour.steps.length).toBe(0);

    return cs.addStepToTour(tour, 'path', 'placement', $el).then(t => {
      expect(tour.steps.length).toBe(1);
      expect($el.querySelector('textarea').value).toEqual(t.toYAML());
    });
  });
});

describe('updateStatus()', () => {
  it('updates the status message', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder">' +
      '<textarea></textarea>' +
      '<div id="galaxy-tourbuilder-status"></div>' +
      '</div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect(getStatus($el).innerHTML).toEqual('');

    cs.updateStatus('hello, world', $el);
    expect(getStatus($el).innerHTML).toEqual('hello, world');
  });
});
