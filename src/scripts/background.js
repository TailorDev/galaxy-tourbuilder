/* @flow */
import ext from './utils/ext';
import { ACTION_ENABLE } from './actions';

type Tab = {
  id: number,
};

let isActive: { [number]: boolean } = {};

const toggle = (active: boolean, tabId: number, callback: Function) => {
  ext.tabs.sendMessage(
    tabId,
    { action: ACTION_ENABLE, value: active },
    {},
    callback
  );
};

const run = (enable: boolean, tabId: number) => {
  toggle(enable, tabId, () => {
    ext.browserAction.setIcon({
      tabId,
      path: {
        '19': enable ? 'icons/icon-19.png' : 'icons/disabled/icon-19.png',
        '38': enable ? 'icons/icon-38.png' : 'icons/disabled/icon-38.png',
      },
    });
  });
};

ext.tabs.onUpdated.addListener((tabId: number, info) => {
  if (info.status === 'complete') {
    if (isActive[tabId] === undefined) {
      return;
    }

    run(isActive[tabId], tabId);
  }
});

ext.browserAction.onClicked.addListener((tab: Tab) => {
  if (isActive[tab.id] === undefined) {
    isActive[tab.id] = true;
  } else {
    isActive[tab.id] = !isActive[tab.id];
  }

  run(isActive[tab.id], tab.id);
});
