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
});
