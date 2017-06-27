import ext from './utils/ext';
import { ACTION_ENABLE } from './actions';

const toggle = (isRecording, callback) => {
  ext.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    ext.tabs.sendMessage(
      activeTab.id,
      { action: ACTION_ENABLE, value: isRecording },
      callback
    );
  });
};

let isRecording = false;
ext.browserAction.onClicked.addListener((tab) => {
  if (isRecording) {
    // send a message to *stop* recording, and toggle the view.
    toggle(false, () => {
      ext.browserAction.setIcon({
        tabId: tab.id, path: {
          "19": "icons/disabled/icon-19.png",
          "38": "icons/disabled/icon-38.png"
        }
      });
    });
  } else {
    // send a message to *start* recording, and toggle the view.
    toggle(true, () => {
      ext.browserAction.setIcon({
        tabId: tab.id, path: {
          "19": "icons/icon-19.png",
          "38": "icons/icon-38.png"
        }
      });
    });
  }

  isRecording = !isRecording;
});
