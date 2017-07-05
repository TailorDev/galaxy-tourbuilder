/* @flow */
import yaml from 'js-yaml';

type TourStep = {
  title: string,
  content: string,
  element?: string,
  placement?: string,
  intro?: string,
  position?: string,
  preclick?: Array<string>,
  postclick?: Array<string>,
  textinsert?: string,
  orphan?: boolean,
  onShow?: Function,
  onNext?: Function,
  onShown?: Function,
};

class GalaxyTour {
  id: string;
  name: string;
  description: string;
  title_default: string;
  steps: Array<TourStep>;

  constructor() {
    this.id = 'new-tour';
    this.name = 'Galaxy Tour';
    this.description =
      'This is a new tour created with the Galaxy Tour Builder extension.';
    this.title_default = 'Galaxy Tour';
    this.steps = [];
  }

  toYAML(): string {
    const { id, name, description, title_default, steps } = this;
    const obj = Object.assign({}, {
      id,
      name,
      description,
      title_default,
      steps: steps.map(s => {
        // exclude blank attributes to clean YAML
        Object.keys(s).forEach(k => {
          // whitelist attrs we always want
          if (k === 'content') {
            return;
          }

          if (s[k] === undefined || s[k] === '' || s[k] === null || s[k].length === 0) {
            delete s[k];
          }
        });

        return s;
      }),
    });

    return yaml.dump(obj);
  }

  fromYAML(content: string) {
    const data = yaml.load(content);

    ['id', 'name', 'description', 'title_default', 'steps'].forEach(prop => {
      // cf. https://github.com/facebook/flow/issues/103
      var that: { [key: string]: string } = this;
      that[prop] = data[prop] || '';
    });
  }

  addStep(path: string) {
    const id = this.steps.length + 1;

    const preclick = [];
    if (/toolTitle/.test(path)) {
      preclick.push(path);
    }

    this.steps.push({
      title: `Step ${id}`,
      element: path,
      content: '',
      placement: '',
      // Note: this is Galaxy specific...
      intro: '',
      preclick,
      postclick: [],
      textinsert: '',
    });
  }

  getStepsForInjection(): Array<TourStep> {
    // mimic Galaxy, not exhaustive yet
    const steps = this.steps.map(s => {
      const step: TourStep = Object.assign({}, s);

      if (step.preclick) {
        // we use $ (jQuery) because this will be injected into Galaxy
        // cf. contentscript.js code (run)
        step.onShow = function() {
          this.preclick.forEach(el => {
            // $FlowFixMe
            $(el).click();
          });
        };
      }

      if (step.postclick) {
        // we use $ (jQuery) because this will be injected into Galaxy
        // cf. contentscript.js code (run)
        step.onNext = function() {
          this.postclick.forEach(el => {
            // $FlowFixMe
            $(el).click();
          });
        };
      }

      if (step.textinsert) {
        // we use $ (jQuery) because this will be injected into Galaxy
        // cf. contentscript.js code (run)
        step.onShown = function() {
          // $FlowFixMe
          $(this.element).val(this.textinsert).trigger('change');
        };
      }

      // backport Galaxy tweaks from Python now...
      // cf. https://github.com/galaxyproject/galaxy/blob/386afbb4f6ac703c60d2ffd975a1c3740f67457b/lib/galaxy/tours/__init__.py#L14
      if (step.intro) {
        step.content = step.intro;
      }

      if (step.position) {
        step.placement = step.position;
      }

      if (!step.element) {
        step.orphan = true;
      }

      if (this.title_default && !step.title) {
        step.title = this.title_default;
      }

      return step;
    });

    return steps;
  }
}

export default GalaxyTour;
