/* @flow */
import ext from './utils/ext';
import { ACTION_ENABLE } from './actions';

type Tab = {
  id: number,
};

let isActive: Array<boolean> = [];

const toggle = (active: boolean, callback: Function) => {
  ext.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    ext.tabs.sendMessage(
      activeTab.id,
      { action: ACTION_ENABLE, value: active },
      callback
    );
  });
};

const run = (active: boolean, tabId: number) => {
  if (active) {
    toggle(false, () => {
      ext.browserAction.setIcon({
        tabId,
        path: {
          '19': 'icons/disabled/icon-19.png',
          '38': 'icons/disabled/icon-38.png',
        },
      });
    });
  } else {
    toggle(true, () => {
      ext.browserAction.setIcon({
        tabId,
        path: {
          '19': 'icons/icon-19.png',
          '38': 'icons/icon-38.png',
        },
      });
    });
  }

  isActive[tabId] = !active;
};

ext.tabs.onUpdated.addListener((tabId: number, info) => {
  if (info.status === 'complete') {
    run(!isActive[tabId], tabId);
  }
});

ext.browserAction.onClicked.addListener((tab: Tab) => {
  run(isActive[tab.id] || false, tab.id);
});
