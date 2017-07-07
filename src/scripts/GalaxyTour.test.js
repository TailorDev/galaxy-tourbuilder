import GalaxyTour from './GalaxyTour';

describe('GalaxyTour', () => {
  it('can be instantiated', () => {
    const t = new GalaxyTour();
    expect(t.getStepsForInjection()).toHaveLength(0);
  });

  it('toYAML()', () => {
    const t = new GalaxyTour();
    expect(t.toYAML()).toContain(`id: new-tour
name: Galaxy Tour
description: This is a new tour created with the Galaxy Tour Builder extension.
title_default: Galaxy Tour
steps: []`);

    t.addStep('path');
    expect(t.toYAML()).toEqual(`id: new-tour
name: Galaxy Tour
description: This is a new tour created with the Galaxy Tour Builder extension.
title_default: Galaxy Tour
steps:
  - title: Step 1
    element: path
    content: ''
    placement: right
`);

    t.addStep(
      '#ngs:_deeptools .toolTitle a[href$="/tool_runner?tool_id=toolshed.g2.bx.psu.edu%2Frepos%2Fbgruening%2Fdeeptools_plot_enrichment%2Fdeeptools_plot_enrichment%2F2.5.0.0"]'
    );
    expect(t.toYAML()).toEqual(`id: new-tour
name: Galaxy Tour
description: This is a new tour created with the Galaxy Tour Builder extension.
title_default: Galaxy Tour
steps:
  - title: Step 1
    element: path
    content: ''
    placement: right
  - title: Step 2
    element: '#tool-search'
    content: ''
    placement: right
    postclick:
      - >-
        a[href$="/tool_runner?tool_id=toolshed.g2.bx.psu.edu%2Frepos%2Fbgruening%2Fdeeptools_plot_enrichment%2Fdeeptools_plot_enrichment%2F2.5.0.0"]
`);
  });

  it('fromYAML()', () => {
    const t = new GalaxyTour();
    t.fromYAML(`steps: [ { content: 'hello' } ]`);

    const steps = t.getStepsForInjection();
    expect(steps).toHaveLength(1);
    expect(steps[0]).toHaveProperty('content');
  });

  it('getStepsForInjection()', () => {
    const t = new GalaxyTour();
    t.fromYAML(`
title_default: 'default-title'
steps:
  - intro: 'hello'
  - position: 'left'
    title: 'left-pos'
    element: body
    `);

    const steps = t.getStepsForInjection();
    expect(steps).toHaveLength(2);
    // galaxy hacks
    expect(steps[0]).toHaveProperty('content', 'hello');
    expect(steps[0]).toHaveProperty('title', 'default-title');
    expect(steps[0]).toHaveProperty('orphan', true);
    expect(steps[1]).toHaveProperty('placement', 'left');
    expect(steps[1]).toHaveProperty('title', 'left-pos');
    expect(steps[1]).toHaveProperty('element', 'body');
    expect(steps[1]).not.toHaveProperty('orphan');
  });
});
