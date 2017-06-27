import ext from './utils/ext';
import { ACTION_TOGGLE_RECORD } from './actions';

const updateIcon = () => {
  // TODO: update icon
};

const toggle = (isRecording, callback) => {
  ext.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    ext.tabs.sendMessage(
      activeTab.id,
      { action: ACTION_TOGGLE_RECORD, value: isRecording },
      callback
    );
  });
};

let isRecording = false;
ext.browserAction.onClicked.addListener(() => {
  if (isRecording) {
    // send a message to *stop* recording, and toggle the view.
    toggle(false, () => {
      updateIcon();
    });
  } else {
    // send a message to *start* recording, and toggle the view.
    toggle(true, () => {
      updateIcon();
    });
  }

  isRecording = !isRecording;
});
