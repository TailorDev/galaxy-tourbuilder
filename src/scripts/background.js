import ext from './utils/ext';
import { ACTION_ENABLE } from './actions';

let isActive = false;

const toggle = (active, callback) => {
  ext.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    ext.tabs.sendMessage(
      activeTab.id,
      { action: ACTION_ENABLE, value: active },
      callback
    );
  });
};

const run = (active, tabId) => {
  if (active) {
    toggle(false, () => {
      ext.browserAction.setIcon({
        tabId: tabId, path: {
          "19": "icons/disabled/icon-19.png",
          "38": "icons/disabled/icon-38.png"
        }
      });
    });
  } else {
    toggle(true, () => {
      ext.browserAction.setIcon({
        tabId: tabId, path: {
          "19": "icons/icon-19.png",
          "38": "icons/icon-38.png"
        }
      });
    });
  }

  isActive = !active;
};

ext.tabs.onUpdated.addListener((tabId , info) => {
  if (info.status === 'complete') {
    run(!isActive, tabId);
  }
});

ext.browserAction.onClicked.addListener((tab) => {
  run(isActive, tab.id);
});
