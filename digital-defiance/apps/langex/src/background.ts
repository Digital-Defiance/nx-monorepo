// src/background.ts
/// <reference types="chrome"/>
import {
  googleTranslateBrowserTabLookup,
  lingvoLookup,
  MessageContext,
  SettingsManager,
} from '@digital-defiance/langex-core';

function onBrowserClickHandler(clickedTab: chrome.tabs.Tab) {
  chrome.tabs.create(
    {
      url: chrome.extension.getURL('index.html'),
    },
    function (createdTab: chrome.tabs.Tab) {
      return;
    }
  );
}

function onInstallHandler(details: chrome.runtime.InstalledDetails) {
  // create new menu
  const topId = chrome.contextMenus.create({
    id: 'langex_context_menu',
    title: 'Language Extension',
    contexts: ['selection', 'editable'],
  });
  chrome.contextMenus.create({
    id: 'lingvoLookup',
    title: 'Look up word with Lingvo: %s',
    contexts: ['selection'],
    parentId: topId,
  });
  chrome.contextMenus.create({
    id: 'googleTranslate',
    title: 'Translate text with Google: %s',
    contexts: ['selection'],
    parentId: topId,
  });
}

function contextClickHandler(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  const settingsManager: SettingsManager = new SettingsManager(
    MessageContext.Background
  );

  switch (info.menuItemId) {
    case 'lingvoLookup':
      lingvoLookup(
        settingsManager.Settings.primaryLanguage,
        settingsManager.studiedLanguages,
        info,
        tab
      );
      break;
    case 'googleTranslate':
      googleTranslateBrowserTabLookup(
        settingsManager.Settings.primaryLanguage,
        settingsManager.studiedLanguages,
        info,
        tab
      );
      break;
  }
}

function onTabUpdatedHandler(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) {
  console.log('pageLoadHandler', tab);
  if (changeInfo.status === 'complete') {
    // process the text of the page
    console.log('tab updated', tabId, changeInfo, tab);
  }
}

function changeExtensionEnabled() {
  const settingsManager: SettingsManager = new SettingsManager(
    MessageContext.Background
  );

  if (settingsManager.LocalSettings.extensionEnabled) {
    chrome.runtime.onInstalled.addListener(onInstallHandler);
    chrome.browserAction.onClicked.addListener(onBrowserClickHandler);
    chrome.contextMenus.onClicked.addListener(contextClickHandler);
    chrome.tabs.onUpdated.addListener(onTabUpdatedHandler);
  } else {
    chrome.runtime.onInstalled.removeListener(onInstallHandler);
    chrome.browserAction.onClicked.removeListener(onBrowserClickHandler);
    chrome.contextMenus.onClicked.removeListener(contextClickHandler);
    chrome.tabs.onUpdated.removeListener(onTabUpdatedHandler);
  }
}

changeExtensionEnabled();
