chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.contextMenus.create({
      id: 'save-to-reading-list',
      title: 'Save to Reading List Pro',
      contexts: ['page', 'link'],
    });
  }
});

chrome.contextMenus.onClicked.addListener((_info, _tab) => {
  // Full save implementation in Day 4
});
