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
      // Note: this is Galaxy specific...
      preclick,
      postclick: [],
    });
  }

  getSteps() {
    // mimic Galaxy, not exhaustive yet
    const steps = this.steps.map(s => {
      const step = Object.assign({}, s);

      if (step.preclick) {
        step.onShow = () => {
          step.preclick.forEach(el => {
            document.querySelector(el).click();
          });
        };
      }

      if (step.postclick) {
        step.onNext = () => {
          step.postclick.forEach(el => {
            document.querySelector(el).click();
          });
        };
      }

      return step;
    });

    return steps;
  }
}

export default GalaxyTour;
