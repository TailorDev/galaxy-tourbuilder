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
      intro: '',
      preclick,
      postclick: [],
      textinsert: '',
    });
  }

  getSteps() {
    // mimic Galaxy, not exhaustive yet
    const steps = this.steps.map(s => {
      const step = Object.assign({}, s);

      if (step.preclick) {
        // we use $ (jQuery) because this will be injected into Galaxy
        // cf. contentscript.js code (run)
        step.onShow = function() {
          this.preclick.forEach(el => {
            $(el).click();
          });
        };
      }

      if (step.postclick) {
        // we use $ (jQuery) because this will be injected into Galaxy
        // cf. contentscript.js code (run)
        step.onNext = function() {
          this.postclick.forEach(el => {
            $(el).click();
          });
        };
      }

      if (step.textinsert) {
        // we use $ (jQuery) because this will be injected into Galaxy
        // cf. contentscript.js code (run)
        step.onShown = function() {
          $(this.element).val(this.textinsert).trigger("change");
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
