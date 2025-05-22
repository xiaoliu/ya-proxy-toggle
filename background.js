let proxystate = false;
let logging = false;
let proxysettings = {};

// error logging for promises
function onError(e = "error log") {
  if (logging) {
    console.error(e);
  }
}

// fulfilled logging for promises
function resolveLog(e = "Promise fulfilled") {
  if (logging) {
    console.log(e);
  }
}

// general logging with timestamp
function appLog(e) {
  if (logging) {
    const timestamp = new Date().toISOString();
    if (typeof e == "object") {
      console.log(`[${timestamp}]: ` + JSON.stringify(e));
    } else {
      console.log(`[${timestamp}]: ` + e);
    }
  }
}

// update toolbar icon according to proxy state
function updateToolBarIcon(newproxystate) {
  browser.browserAction.setIcon({
    path: newproxystate
      ? { 96: "icons/proxy.png" }
      : { 96: "icons/direct.png" },
  });
  proxystate = newproxystate;
}

// store proxy settings and logging state to local extension storage (require storage permissions)
function stashProxyValues(proxySettings) {
  browser.storage.local.set(proxySettings).then(resolveLog, onError);
  browser.storage.local.set({ logging }).then(resolveLog, onError);
}

// retrieve proxy settings from local extension storage then update toolbar icon
function checkProxyState() {
  function updateUI(storedvalue) {
    proxysettings.value = storedvalue.value;
    browser.proxy.settings.set(proxysettings);
    updateToolBarIcon(proxysettings.value.proxyType != "none");
  }
  const getStorageSettings = browser.storage.local.get("value");
  getStorageSettings.then(updateUI, onError);
}

// toggle FF proxy settings according to proxy state
function changeProxyState() {
  browser.storage.local.get("logging").then(function (storedsettings) {
    logging = storedsettings.logging;
  }, onError);

  browser.proxy.settings.get({}).then(function (currentsettings) {
    appLog(proxysettings);
    proxysettings.value = currentsettings.value;
    if (proxystate) {
      proxysettings.value.proxyType = "none";
      browser.proxy.settings.set(proxysettings);
      browser.storage.local.set(proxysettings);
      updateToolBarIcon(false);
    } else {
      proxysettings.value.proxyType = "manual";
      browser.proxy.settings.set(proxysettings);
      browser.storage.local.set(proxysettings);
      updateToolBarIcon(true);
    }
  }, onError);
}

// initial loading setup, retrieve existing settings store to local storage
function addonInit() {
  browser.proxy.settings.get({}).then(function (existingsettings) {
    proxysettings.value = existingsettings.value;
    stashProxyValues(proxysettings);
    if (existingsettings.value.proxyType == "none") {
      updateToolBarIcon(false);
    } else {
      updateToolBarIcon(true);
    }
  }, onError);
}

browser.browserAction.onClicked.addListener(changeProxyState);

// listen for browser activity to reflect current proxy state
browser.tabs.onUpdated.addListener(checkProxyState);
browser.tabs.onActivated.addListener(checkProxyState);
browser.windows.onFocusChanged.addListener(checkProxyState);

// check proxy status on initial loading
addonInit();
