import yaml from 'js-yaml';

class GalaxyTour {
  constructor() {
    this.id = 'new-tour';
    this.name = 'New Tour';
    this.description = 'Hello, this is a new tour!';
    this.title_default = 'New Tour';

    this.steps = [];
  }

  toYAML() {
    const { id, name, description, title_default, steps } = this;

    return yaml.dump({ id, name, description, title_default, steps });
  }

  fromYAML(content) {
    const data = yaml.load(content);

    ['id', 'name', 'description', 'title_default', 'steps'].forEach(prop => {
      this[prop] = data[prop];
    });
  }

  addStep(path) {
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
      intro: '',
      // Note: this is Galaxy specific...
      preclick,
      postclick: [],
      textinsert: null,
    });
  }

  getSteps() {
    // mimic Galaxy, not exhaustive yet
    const steps = this.steps.map(s => {
      const step = Object.assign({}, s);

      if (step.preclick) {
        step.onShow = function() {
          this.preclick.forEach(el => {
            document.querySelector(el).click();
          });
        };
      }

      if (step.postclick) {
        step.onNext = function() {
          this.postclick.forEach(el => {
            document.querySelector(el).click();
          });
        };
      }

      if (step.textinsert) {
        step.onShown = function() {
          const event = document.createEvent('HTMLEvents');
          event.initEvent('change', true, false);

          document.querySelector(this.element).value = this.textinsert;
          this.element.dispatchEvent(event);
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
