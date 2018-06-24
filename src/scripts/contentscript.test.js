import * as cs from './contentscript';
import GalaxyTour from './GalaxyTour';
import * as html from './utils/html';

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

    expect(html.getEditor($el).value).toEqual('');

    return cs.syncEditorWithTour(tour, $el).then((t) => {
      expect(t).toBe(tour);
      expect(html.getEditor($el).value).toEqual(tour.toYAML());
    });
  });

  it('rejects the promise if error', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea></textarea></div>';

    const tour = new GalaxyTour();
    const $el = document.querySelector('#galaxy-tourbuilder');
    expect(html.getEditor($el).value).toEqual('');

    // force-throw an error
    tour.toYAML = () => {
      throw new Error('error message');
    };

    return cs.syncEditorWithTour(tour, $el).catch((e) => {
      expect(e.message).toEqual('error message');
    });
  });
});

describe('newTour()', () => {
  it('creates a new tour and updates the editor accordingly', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea>id: foo</textarea></div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect(html.getEditor($el).value).toEqual('id: foo');

    return cs.newTour($el).then((t) => {
      expect(t).toMatchObject(new GalaxyTour());
      expect(html.getEditor($el).value).toEqual(t.toYAML());
    });
  });
});

describe('saveTour()', () => {
  it('updates the tour using the content of the editor', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea>id: foo</textarea></div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect(html.getEditor($el).value).toEqual('id: foo');

    return cs.saveTour(new GalaxyTour(), $el).then((t) => {
      expect(t.id).toBe('foo');
      expect(html.getEditor($el).value).toEqual(t.toYAML());
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

    return cs.saveTour(tour, $el).catch((e) => {
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
    expect(html.getEditor($el).value).toEqual('');

    expect(tour.steps.length).toBe(0);

    return cs.addStepToTour(tour, 'path', 'placement', $el).then((t) => {
      expect(tour.steps.length).toBe(1);
      expect(html.getEditor($el).value).toEqual(t.toYAML());
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
    expect(html.getStatus($el).innerHTML).toEqual('');

    cs.updateStatus('hello, world', $el);
    expect(html.getStatus($el).innerHTML).toEqual('hello, world');
  });
});

describe('onClick()', () => {
  it('can toggle the editor', () => {
    document.body.innerHTML = '<div id="galaxy-tourbuilder"></div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect($el.className).toBe('');

    cs.onClick({ target: { id: html.BTN_TOGGLE } });
    expect($el.className).toBe('hidden');

    cs.onClick({ target: { id: html.BTN_TOGGLE } });
    expect($el.className).toBe('');
  });

  it('can create a new tour', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea>id: foo</textarea></div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect(html.getEditor($el).value).toEqual('id: foo');

    cs.onClick({ target: { id: html.BTN_NEW } });
    expect(html.getEditor($el).value).not.toEqual('id: foo');
    expect(html.getEditor($el).value).toContain('id: new-tour');
  });

  it('can start/stop recording', () => {
    document.body.innerHTML = html.createPanel().outerHTML;

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect($el.className).toBe('');
    expect($el.querySelector(`#${html.BTN_NEW}`).disabled).toBe(false);
    expect($el.querySelector(`#${html.BTN_PLAY}`).disabled).toBe(false);
    expect($el.querySelector(`#${html.BTN_EXPORT}`).disabled).toBe(false);

    cs.onClick({ target: { id: html.BTN_RECORD } });

    expect($el.className).toBe('recording');
    expect($el.querySelector(`#${html.BTN_NEW}`).disabled).toBe(true);
    expect($el.querySelector(`#${html.BTN_PLAY}`).disabled).toBe(true);
    expect($el.querySelector(`#${html.BTN_EXPORT}`).disabled).toBe(true);

    cs.onClick({ target: { id: html.BTN_RECORD } });

    expect($el.className).toBe('');
    expect($el.querySelector(`#${html.BTN_NEW}`).disabled).toBe(false);
    expect($el.querySelector(`#${html.BTN_PLAY}`).disabled).toBe(false);
    expect($el.querySelector(`#${html.BTN_EXPORT}`).disabled).toBe(false);
  });

  it('can save the content of a tour', () => {
    document.body.innerHTML =
      '<div id="galaxy-tourbuilder"><textarea>id: foo</textarea></div>';

    const $el = document.querySelector('#galaxy-tourbuilder');
    expect(html.getEditor($el).value).toEqual('id: foo');

    // This is possible because we return the promise of `saveTour()` in the
    // code. Also, saving a tour adds missing information to the YAML.
    return cs.onClick({ target: { id: html.BTN_SAVE } }).then(() => {
      expect(html.getEditor($el).value).toEqual(
        [
          'id: foo',
          "name: ''",
          "description: ''",
          "title_default: ''",
          'steps: []\n',
        ].join('\n')
      );
    });
  });

  it('can handle error on save', () => {
    document.body.innerHTML = html.createPanel().outerHTML;

    const $el = document.querySelector('#galaxy-tourbuilder');
    // here the steps attribute has an opening bracket, but not the closing
    // one, resulting in an error.
    html.getEditor($el).innerHTML = 'id: foo\nsteps: [';

    expect(html.getStatus($el).innerHTML).toEqual('');

    // This is possible because we return the promise of `saveTour()` in the
    // code.
    return cs.onClick({ target: { id: html.BTN_SAVE } }).then(() => {
      expect(html.getStatus($el).innerHTML).toContain(
        'Error: unexpected end of the stream within a flow collection at line 3, column 1'
      );
    });
  });
});

describe('runTour()', () => {
  beforeEach(() => {
    window.alert = jest.fn();
    window.jQuery = jest.fn();
  });

  it('creates a `script` element', () => {
    const spy = jest.spyOn(document.head, 'appendChild');

    const tour = new GalaxyTour();
    cs.runTour(tour);

    expect(spy).toHaveBeenCalled();
  });

  it('removes the `script` element after having run', () => {
    const tour = new GalaxyTour();
    cs.runTour(tour);

    expect(document.head.innerHTML).toEqual('');
  });

  it('parses the tour steps', () => {
    class FakeTour {
      constructor(props) {
        FakeTour.props = props;
      }

      goTo() {}

      init() {}

      restart() {}
    }

    // Create a fake Tour class so that we can fully test the logic that is
    // injected in the page when the "play" button is clicked.
    window.Tour = FakeTour;

    const tour = new GalaxyTour();
    // See: https://github.com/TailorDev/galaxy-tourbuilder/issues/14
    tour.fromYAML(`
id: new-tour
steps:
  - title: Step 1
    element: '#tool-panel-upload-button .fa.fa-upload'
    content: 'hello'
    placement: right
    postclick:
      - '#tool-panel-upload-button .fa.fa-upload'
    `);
    cs.runTour(tour);

    expect(FakeTour.props).toEqual({
      steps: [
        {
          title: 'Step 1',
          element: '#tool-panel-upload-button .fa.fa-upload',
          content: 'hello',
          placement: 'right',
          postclick: ['#tool-panel-upload-button .fa.fa-upload'],
          onNext: expect.any(Function),
        },
      ],
    });
  });
});
