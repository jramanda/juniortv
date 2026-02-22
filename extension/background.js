// Corner Spotter - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Corner Spotter extension installed');
  
  // Set default config
  chrome.storage.local.get(['cornerSpotterConfig'], (result) => {
    if (!result.cornerSpotterConfig) {
      chrome.storage.local.set({
        cornerSpotterConfig: {
          apiUrl: '',
          botToken: '',
          chatId: '',
          telegramEnabled: true,
          minProbability: 60,
          minOdds: 1.20,
          maxOdds: 2.50,
          autoTelegram: true,
          analyzeLive: true,
          analyzePrematch: true
        }
      });
    }
  });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getConfig') {
    chrome.storage.local.get(['cornerSpotterConfig'], (result) => {
      sendResponse(result.cornerSpotterConfig || {});
    });
    return true;
  }
  
  if (request.action === 'saveSignal') {
    chrome.storage.local.get(['cornerSpotterSignals'], (result) => {
      const signals = result.cornerSpotterSignals || [];
      signals.unshift(request.signal);
      // Keep only last 100 signals
      if (signals.length > 100) {
        signals.pop();
      }
      chrome.storage.local.set({ cornerSpotterSignals: signals }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

// Badge update for active tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('bet365.com')) {
    chrome.action.setBadgeText({ text: '●', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId });
  }
});
