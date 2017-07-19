import { path } from './dom';

test('utils/dom', () => {
  // Set up our document body
  document.body.innerHTML = `
    <div class="foo">
      <div>
        <span id="username" />
        <button id="button" />
      </div>
      <div class="bar">
        <ul>
          <li id="el1">
            <a href="">link1</a>
            <a href="">link1</a>
          </li>
        </ul>
      </div>
      <span class="fizz buzz">message</span>
      <a class="toolshed.g2.bx.psu.edu/repos/iuc/bam_to_scidx/bam_to_scidx/1.0.0 tool-link" href="https://example.org/tool_runner?tool_id=toolshed.g2.bx.psu.edu%2Frepos%2Fiuc%2Fbam_to_scidx%2Fbam_to_scidx%2F1.0.0">
        Convert BAM to ScIdx
      </a>
      <button type="button" class="ui-button-default btn btn-default" id="btn-new" style="float: right;" data-original-title="" title=""><i class="icon fa fa-edit ui-margin-right"></i><span class="title">Paste/Fetch data</span><div class="progress" style="display: none;"><div class="progress-bar" style="width: 0%;"></div></div></button>
      <button type="button" id="btn-new-without-children">click me</button>
      <span class="with-extra-space "></span>
    </div>
    <!-- fixtures for Galaxy tour_id attribute -->
    <div class="ui-form-element section-row" id="uid-10" tour_id="grouping" style="display: block;">
      <div class="ui-form-error ui-error" style="display: none;">
        <span class="fa fa-arrow-down"></span><span class="ui-form-error-text"></span>
      </div>
      <div class="ui-form-field" style="display: block;">
        <input class="ui-input" id="field-uid-10" type="text" style="display: inline-block;">
        <span class="ui-form-info">Example: to group by the first and fourth fields, use 1,4.</span>
      </div>
    </div>
    <div class="ui-form-element section-row" id="uid-11" tour_id="" style="display: block;">
      <div class="ui-form-field" style="display: block;">
        <input class="ui-input" id="field-uid-11" type="text" style="display: inline-block;">
        <span class="ui-form-info">Example: to group by the first and fourth fields, use 1,4.</span>
      </div>
    </div>
    <!-- fixtures for Galaxy tour_id attribute in workflow -->
    <div class="ui-form-element section-row" id="uid-1" tour_id="new_history|check" style="display: block;">
      <div class="ui-form-error ui-error" style="display: none;"><span class="fa fa-arrow-down"></span><span class="ui-form-error-text"></span></div>
      <div class="ui-form-title">
        <div class="ui-form-collapsible" style="display: none;"><i class="ui-form-collapsible-icon"></i><span class="ui-form-collapsible-text"></span></div><span class="ui-form-title-text" style="display: inline;">Send results to a new history</span></div>
      <div class="ui-form-field" style="display: block;">
        <div id="field-uid-1" class="ui-options" style="display: block;">
          <div style="display: none;"></div>
          <div class="ui-options-menu" style="display: block;"></div>
          <div class="btn-group ui-radiobutton" data-toggle="buttons" style="display: inline-block;"><label class="btn btn-default ui-option" data-original-title="" title=""><input type="radio" name="field-uid-1" value="true">Yes</label><label class="btn btn-default ui-option active" data-original-title="" title=""><input type="radio" name="field-uid-1" value="false">No</label></div>
        </div><span class="ui-form-info"></span>
        <div class="ui-form-backdrop" style="display: none;"></div>
      </div>
      <div class="ui-form-preview" style="display: none;"></div>
    </div>
  `;

  expect(path(document.querySelector('#username'))).toEqual('#username');
  expect(path(document.querySelector('#el1'))).toEqual('#el1');
  expect(path(document.querySelector('.bar > ul > li'))).toEqual('#el1');
  expect(path(document.querySelector('.bar'))).toEqual('body .foo .bar');
  expect(path(document.querySelector('.bar > ul > li > a'))).toEqual('#el1 a');
  expect(path(document.querySelector('.foo > span'))).toEqual(
    'body .foo .fizz.buzz'
  );
  expect(
    path(document.querySelector('.foo > a'), 'https://example.org')
  ).toEqual(
    'body .foo a[href$="/tool_runner?tool_id=toolshed.g2.bx.psu.edu%2Frepos%2Fiuc%2Fbam_to_scidx%2Fbam_to_scidx%2F1.0.0"]'
  );
  expect(path(document.querySelector('#btn-new .title'))).toEqual('#btn-new');
  expect(path(document.querySelector('#btn-new-without-children'))).toEqual(
    '#btn-new-without-children'
  );
  expect(path(document.querySelector('.foo .with-extra-space'))).toEqual(
    'body .foo .with-extra-space'
  );
  expect(path(document.querySelector('foo'))).toBe(null);
  // handle Galaxy `tour_id` attributes
  expect(path(document.querySelector('#field-uid-10'))).toEqual(
    'div[tour_id="grouping"]'
  );
  expect(path(document.querySelector('#uid-10 span'))).toEqual(
    'div[tour_id="grouping"]'
  );
  expect(path(document.querySelector('#field-uid-11'))).toEqual(
    '#field-uid-11'
  );
  expect(path(document.querySelector('#uid-11 span'))).toEqual(
    '#uid-11 .ui-form-field .ui-form-info'
  );
  expect(path(document.querySelector('#field-uid-1 .btn-group'))).toEqual(
    'div[tour_id="new_history|check"]'
  );
  expect(path(document.querySelector('#field-uid-1 .btn-group label'))).toEqual(
    'div[tour_id="new_history|check"]'
  );
});
